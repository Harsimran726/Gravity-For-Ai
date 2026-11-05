export const HISAB_PLANS = [
  {id: 'free', name: 'Free', amount: 0, durationMonths: 0, maxWorkers: 3, maxClients: 2},
  {id: 'starter', name: 'Starter', amount: 29900, durationMonths: 1, maxWorkers: 10, maxClients: 5},
  {id: 'professional', name: 'Professional', amount: 49900, durationMonths: 1, maxWorkers: 25, maxClients: 15},
  {id: 'business', name: 'Business', amount: 99900, durationMonths: 1, maxWorkers: 50, maxClients: 50},
] as const;

export function normalizePlanId(id: string) {
  const aliases: Record<string, string> = {starter_299: 'starter', pro_499: 'professional', pro: 'professional', business_999: 'business'};
  return aliases[id] ?? id;
}

export function androidPlanId(id?: string) {
  const aliases: Record<string, string> = {starter: 'starter_299', professional: 'pro_499', business: 'business_999'};
  return id ? aliases[id] ?? id : 'free';
}
