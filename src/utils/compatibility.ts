import { BuildState } from '../types';

export interface CompatibilityIssue {
  type: 'error' | 'warning';
  message: string;
}

export function checkCompatibility(build: BuildState): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const { CPU, MOTHERBOARD } = build;

  if (CPU && MOTHERBOARD) {
    const isIntel = CPU.brand?.toLowerCase() === 'intel' || CPU.name.toLowerCase().includes('intel');
    // Check for evm and either h16 or h61 (in case of typo in user request)
    const isEVMH16 = MOTHERBOARD.name.toLowerCase().includes('evm') && 
                     (MOTHERBOARD.name.toLowerCase().includes('h16') || MOTHERBOARD.name.toLowerCase().includes('h61'));

    if (isIntel && isEVMH16) {
      issues.push({
        type: 'error',
        message: 'CPU and Motherboard socket mismatch: Intel CPU is not compatible with EVM H16 Micro-ATX Motherboard.'
      });
    }
  }

  return issues;
}
