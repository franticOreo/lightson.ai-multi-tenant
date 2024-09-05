import { updateProjectFromMainAndDeploy, updateEnvVars, payloadFieldToEnvVarMap } from "../../../../utils/vercel"
import isEqual from 'lodash/isEqual'; 
/**
 * Redeploys a Vercel project with new environment variables if there are changes in the specified fields.
 * @param {Object} param0 - The document containing the current and previous state.
 * @param {Object} param0.doc - The current document.
 * @param {Object} param0.previousDoc - The previous document.
 */
export async function redeployProjectWithNewEnvVars({ doc, previousDoc, req }) {
  const fieldsToWatch = ['businessName', 'aboutPage', 'businessAddress',
    'serviceArea', 'phoneNumber', 'operatingHours', 'primaryColor', 'secondaryColor', 'serviceList'];
  const newEnvVars = [];

  if (req?.context.isSignupOrOnboarding) {
    console.log('Skipping redeployment (redeployProjectWithNewEnvVars) due to onboarding flow. ');
    return;
  }

  for (const field of fieldsToWatch) {
    if (!isEqual(doc[field], previousDoc[field])) {
      const envVarKey = payloadFieldToEnvVarMap[field];
      if (envVarKey) {
        let value = doc[field];
        if (Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        newEnvVars.push({ key: envVarKey, value: value });
      }
    }
  }

  if (newEnvVars.length > 0) {
    const projectId = doc.vercelProjectId;
    if (!projectId) {
      console.log('Skipping redeployment: vercelProjectId is undefined');
      return;
    }
    console.log('updating vercel project Env Variables for project', projectId)
    await updateEnvVars(projectId, newEnvVars);
    await updateProjectFromMainAndDeploy(doc.instagramHandle, doc.instagramHandle)
  } else {
    console.log('No changes detected in the watched fields');
  }
}