/* eslint-disable @typescript-eslint/no-explicit-any */
export const JurisdictionObject = (
  obConceptModel: any,
  jurisdictionType: any,
  obcmEntitiesMap: any
) => {
  const entities = obConceptModel.entities;
  let resultEntity = null;
  entities.forEach(function (entity: any) {
    if (entity.name === jurisdictionType) {
      resultEntity = entity;
    }

    if (obcmEntitiesMap) {
      obcmEntitiesMap.add(entity.name, entity);
    }
  }, this);
  return resultEntity;
};
