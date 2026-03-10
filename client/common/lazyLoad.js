import { forceCheck } from '@k9/react-lazyload';

export default function startLazyload() {
  setTimeout(forceCheck, 300);
}
