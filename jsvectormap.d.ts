declare module "jsvectormap" {
  interface JsVectorMapOptions {
    map?: string;
    selector?: string;
    regionsSelectable?: boolean;
    markersSelectable?: boolean;
    // Add other options as needed
  }

  class JsVectorMap {
    constructor(options: JsVectorMapOptions);
    // Add other methods as needed
  }

  export default JsVectorMap;
}
