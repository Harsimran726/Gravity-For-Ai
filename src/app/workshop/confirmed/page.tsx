import type {Metadata} from 'next';
import Confirmation from './confirmation';
import '../workshop.css';
export const metadata:Metadata={title:'Workshop booking',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function Page(){return <Confirmation/>;}
