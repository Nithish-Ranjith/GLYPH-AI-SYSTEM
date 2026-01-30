
import React from 'react';
import { SimulationSandbox } from '../SimulationSandbox';
import { PolicyConfig } from '../../types';

interface PolicyViewProps {
  policyConfig: PolicyConfig;
  setPolicyConfig: (config: PolicyConfig) => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({ policyConfig, setPolicyConfig }) => {
  return (
    <div className="w-full h-[650px] animate-in slide-in-from-left-4 fade-in duration-500">
        <SimulationSandbox config={policyConfig} onUpdate={setPolicyConfig} />
    </div>
  );
};
