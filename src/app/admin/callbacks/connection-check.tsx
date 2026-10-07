'use client';
import {useFormState,useFormStatus} from 'react-dom';
import {checkAnalysisConnection} from '@/actions/callback-connection-action';
function Submit(){const {pending}=useFormStatus();return <button disabled={pending} className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">{pending?'Checking analysis…':'Check analysis connection'}</button>;}
export function AnalysisConnectionCheck(){const [state,action]=useFormState(checkAnalysisConnection,{message:''});return <form action={action} className="space-y-3"><Submit/><p aria-live="polite" className="text-sm">{state.message}</p><p className="text-xs">Uses a synthetic conversation and two small model requests. Sends no email or call.</p></form>;}
