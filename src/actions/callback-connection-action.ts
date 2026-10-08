'use server';
import {getAdminSession} from '@/lib/auth';
import {analyseConversation} from '@/lib/callback-recap-analysis';
export async function checkAnalysisConnection(_state:{message:string},_form:FormData){
 const session=await getAdminSession();if(session?.role!=='ADMIN')return {message:'Administrator access required.'};
 try{const result=await analyseConversation([{role:'agent',en_text:'What would you like help with?'},{role:'user',en_text:'I want a website for my bakery. Please email me a recap.'}]);return {message:result.needsReview||result.doNotContact?'Model responded but this test required review. Check configuration.':'Analysis connection works. Synthetic transcript checked; no calls or emails sent.'};}
 catch(error){const reason=error instanceof Error&&(error.message.startsWith('Analysis service HTTP')||error.message.startsWith('Analysis output')||error.message.startsWith('Summary evidence'))?error.message:error instanceof Error&&error.name==='TimeoutError'?'Analysis request timed out.':'Analysis response or evidence checks failed.';return {message:reason+' If model access is denied, save a Sarvam model API key as SARVAM_ANALYSIS_API_KEY in Vercel Production and redeploy.'};}
}
