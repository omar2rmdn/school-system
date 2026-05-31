import type { RelatedResource } from "../../types";

function getRelatedTitle(
  resource: string | RelatedResource,
  labelMap: Map<string, string>,
) {
  if (typeof resource === "object") {
    return resource.title;
  }

  return labelMap.get(resource) ?? resource;
}

function getRelatedId(resource: string | RelatedResource) {
  return typeof resource === "object" ? resource._id : resource;
}

export { getRelatedId, getRelatedTitle };
