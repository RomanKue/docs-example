import {run} from "../lib/run.js";
import {createK8sObjects} from "../lib/unity/app-repo/k8s.js";

run(async () => {
  const appRepos = ['app-test', 'app-approval-plan', 'app-multi-pak', 'app-pmd-data-viewer', 'app-sa-bhe', 'app-lbac',
    'app-services', 'app-ebr', 'app-blacklist-pendelschlag', 'app-pn-interpreter', 'app-fgp', 'app-rocketeers-app', 'app-newapp', 'app-landing-page'];
  await appRepos.forEach(async (repo) => {
    await createK8sObjects('prod', repo);
  });
});
