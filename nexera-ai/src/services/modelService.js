export function getDynamicModel(objectName) {
  const name = objectName.toLowerCase();

  //This is a simulated "search"
  if (name.includes("helmet") || name.includes("hat")) {
    return "/models/helmet.glb";
  }

  if (name.includes("astronaut") || name.includes("space")) {
    return "/models/astronaut.glb";
  }

  return null;
}