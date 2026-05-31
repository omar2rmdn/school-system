import type { TitledResource } from "../../types";

function getRelatedTitle(
  resource: string | TitledResource,
  labelMap: Map<string, string>,
) {
  if (typeof resource === "object") {
    return resource.title;
  }

  return labelMap.get(resource) ?? resource;
}

function getRelatedId(resource: string | TitledResource) {
  return typeof resource === "object" ? resource._id : resource;
}

export { getRelatedId, getRelatedTitle };
