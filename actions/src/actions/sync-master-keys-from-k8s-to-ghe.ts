import {run} from '../lib/run.js';
import {syncMasterKeysFromK8sToGh} from './scripts/sync-master-keys-from-k8s-to-gh.js';

run(syncMasterKeysFromK8sToGh);
