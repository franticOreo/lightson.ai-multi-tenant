import type { PayloadRequest } from "payload/dist/types";

import { isSuperAdmin } from "../../../utilities/isSuperAdmin";

export const isSuperOrPublic = async (args: { req: PayloadRequest }) => {
  const {
    req,
    req: { user, payload },
  } = args;

  if (isSuperAdmin(user)) {
    return true;
  }

  const foundTenants = await payload.find({
    collection: "tenants",
    where: {
      "domains.domain": {
        in: [req.headers.host],
      },
    },
    depth: 0,
    limit: 1,
    req,
  });

  if (foundTenants.totalDocs > 0) {
    return true;
  }
  return false;
};
