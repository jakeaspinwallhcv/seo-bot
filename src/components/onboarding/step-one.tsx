'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { projectSchema, sanitizeDomain, type ProjectFormData } from '@/lib/validations/onboarding'
import { validateTierLimit } from '@/lib/utils/tier-limits'

type StepOneProps = {
  userId: string
  onComplete: (data: ProjectFormData, projectId: string) => void
}

export function StepOne({ userId, onComplete }: StepOneProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit = async (data: ProjectFormData) => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Security: Get user's profile to check subscription tier
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single()

      if (profileError) throw new Error('Failed to load user profile')

      // Security: Count existing projects to enforce tier limits
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (countError) throw new Error('Failed to check project limits')

      // Security: Validate tier limit (throws if exceeded)
      validateTierLimit(
        profile.subscription_tier || 'free',
        'projects',
        count || 0
      )

      // Security: Sanitize domain input
      const cleanDomain = sanitizeDomain(data.domain)

      // Insert project into database
      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: data.name,
          domain: cleanDomain,
          description: data.description || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('Failed to create project. Please try again.')
      }

      // Success - move to next step
      onComplete(
        {
          ...data,
          domain: cleanDomain,
        },
        project.id
      )
    } catch (err: any) {
      console.error('Step one error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Your Website</h2>
        <p className="mt-2 text-sm text-gray-600">
          Let's start by adding the website you want to track.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="My Real Estate Business"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
            Website Domain *
          </label>
          <input
            {...register('domain')}
            type="text"
            id="domain"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="example.com"
            onChange={(e) => {
              const sanitized = sanitizeDomain(e.target.value)
              setValue('domain', sanitized)
            }}
          />
          {errors.domain && (
            <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your domain without http:// or www (e.g., example.com)
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Brief description of your website..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  )
}
