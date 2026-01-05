'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepOne } from './step-one'
import { StepTwo } from './step-two'
import { StepThree } from './step-three'
import { StepFour } from './step-four'
import { StepFive } from './step-five'
import type {
  ProjectFormData,
  KeywordsFormData,
  CompetitorsFormData,
} from '@/lib/validations/onboarding'

export type OnboardingState = {
  currentStep: number
  projectData: ProjectFormData | null
  keywordsData: KeywordsFormData | null
  competitorsData: CompetitorsFormData | null
  projectId: string | null
}

export function OnboardingWizard({ userId }: { userId: string }) {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    projectData: null,
    keywordsData: null,
    competitorsData: null,
    projectId: null,
  })

  const handleNextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
    }))
  }

  const handlePreviousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }))
  }

  const handleStepOneComplete = (data: ProjectFormData, projectId: string) => {
    setState((prev) => ({
      ...prev,
      projectData: data,
      projectId,
    }))
    handleNextStep()
  }

  const handleStepTwoComplete = (data: KeywordsFormData) => {
    setState((prev) => ({
      ...prev,
      keywordsData: data,
    }))
    handleNextStep()
  }

  const handleStepThreeComplete = (data: CompetitorsFormData) => {
    setState((prev) => ({
      ...prev,
      competitorsData: data,
    }))
    handleNextStep()
  }

  const handleStepFourComplete = () => {
    handleNextStep()
  }

  const handleComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="flex items-center"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    state.currentStep >= step
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {state.currentStep > step ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </div>
                {step < 5 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      state.currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Step {state.currentStep} of 5
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white shadow rounded-lg p-6">
          {state.currentStep === 1 && (
            <StepOne
              userId={userId}
              onComplete={handleStepOneComplete}
            />
          )}

          {state.currentStep === 2 && state.projectId && (
            <StepTwo
              projectId={state.projectId}
              onComplete={handleStepTwoComplete}
              onBack={handlePreviousStep}
            />
          )}

          {state.currentStep === 3 && state.projectId && (
            <StepThree
              projectId={state.projectId}
              onComplete={handleStepThreeComplete}
              onBack={handlePreviousStep}
            />
          )}

          {state.currentStep === 4 && state.projectId && state.keywordsData && (
            <StepFour
              projectId={state.projectId}
              keywords={state.keywordsData.keywords}
              domain={state.projectData?.domain || ''}
              onComplete={handleStepFourComplete}
              onBack={handlePreviousStep}
            />
          )}

          {state.currentStep === 5 && (
            <StepFive
              projectName={state.projectData?.name || ''}
              keywordCount={state.keywordsData?.keywords.length || 0}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
