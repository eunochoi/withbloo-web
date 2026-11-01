'use client';

import { ReactNode } from "react";

import { OnboardingProvider } from '../components/features/Onboarding/OnboardingProvider';
import { SettingsProvider } from "../settings/SettingsProvider";
import { TimezoneSync } from "../utils/TimezoneSync";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <SettingsProvider>
      <TimezoneSync />
      <OnboardingProvider>{children}</OnboardingProvider>
    </SettingsProvider>
  );
};
