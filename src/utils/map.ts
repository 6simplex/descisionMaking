/* eslint-disable @typescript-eslint/no-explicit-any */
export function getUserSVG(fillColor: any, strokeColor: any, strokeWidth: any) {
  //fillColor: rgba(255, 255, 0, 0.8)
  //strokeColor: rgba(255, 255, 0, 0.8)
  //strokeWidth: 5

  //<!-- License: PD. Made by tablecheck: https://github.com/tablecheck/tablecheck-icons -->
  return encodeURIComponent(
    '<?xml version="1.0" encoding="utf-8"?>' +
      '<svg width="100px" height="100px" viewBox="-17 0 512 512" ' +
      'version="1.1" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="' +
      fillColor +
      '" stroke="' +
      strokeColor +
      '" stroke-width="' +
      strokeWidth +
      '" d="M341 138C341 67.3075 300.856 16 239 16C177.144 16 137 67.3075 137 138C137 231.394 189 221.676 189 269C189 287.649 139 288 139 288C59.471 288 0 352.471 0 432V464C0 490.51 21.4903 512 48 512H431C457.51 512 479 490.51 479 464V432C479 352.471 418.529 288 339 288C339 288 289 287.649 289 269C289 221.676 341 231.394 341 138Z"></path>' +
      "</svg>"
  );
}
export function getVehicleUserSVG(
  fillColor: any,
  strokeColor: any,
  strokeWidth: any
) {
  //fillColor: rgba(255, 255, 0, 0.8)
  //strokeColor: rgba(255, 255, 0, 0.8)
  //strokeWidth: 5

  //<!-- License: PD. Made by tablecheck: https://github.com/tablecheck/tablecheck-icons -->
  return encodeURIComponent(
    '<?xml version="1.0" encoding="utf-8"?>' +
      '<svg  width="100px" height="100px" viewBox="0 0 122.88 99.36" ' +
      'version="1.1" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="' +
      fillColor +
      '" stroke="' +
      strokeColor +
      '" stroke-width="' +
      strokeWidth +
      '" d="M78.29,23.33h18.44c5.52,0,4.23-0.66,7.33,3.93l15.53,22.97c3.25,4.81,3.3,3.77,3.3,9.54v18.99 c0,6.15-5.03,11.19-11.19,11.19h-2.28c0.2-0.99,0.3-2.02,0.3-3.07c0-8.77-7.11-15.89-15.89-15.89c-8.77,0-15.89,7.11-15.89,15.89 c0,1.05,0.1,2.07,0.3,3.07H58.14c0.19-0.99,0.3-2.02,0.3-3.07c0-8.77-7.11-15.89-15.89-15.89c-8.77,0-15.89,7.11-15.89,15.89 c0,1.05,0.1,2.07,0.3,3.07h-2.65c-5.66,0-10.29-4.63-10.29-10.29V63.05h64.27V23.33L78.29,23.33z M93.82,74.39 c6.89,0,12.48,5.59,12.48,12.49c0,6.89-5.59,12.48-12.48,12.48c-6.9,0-12.49-5.59-12.49-12.48C81.33,79.98,86.92,74.39,93.82,74.39 L93.82,74.39z M42.54,74.39c6.9,0,12.49,5.59,12.49,12.49c0,6.89-5.59,12.48-12.49,12.48c-6.89,0-12.48-5.59-12.48-12.48 C30.06,79.98,35.65,74.39,42.54,74.39L42.54,74.39z M42.54,83.18c2.04,0,3.7,1.65,3.7,3.7c0,2.04-1.65,3.69-3.7,3.69 c-2.04,0-3.69-1.66-3.69-3.69C38.85,84.83,40.51,83.18,42.54,83.18L42.54,83.18z M93.82,83.09c2.09,0,3.79,1.7,3.79,3.79 c0,2.09-1.7,3.79-3.79,3.79c-2.09,0-3.79-1.7-3.79-3.79C90.03,84.78,91.73,83.09,93.82,83.09L93.82,83.09z M89.01,32.35h3.55 l15.16,21.12v6.14c0,1.49-1.22,2.71-2.71,2.71h-16c-1.53,0-2.77-1.25-2.77-2.77V35.13C86.23,33.6,87.48,32.35,89.01,32.35 L89.01,32.35z M5.6,0h64.26c3.08,0,5.6,2.52,5.6,5.6v48.92c0,3.08-2.52,5.6-5.6,5.6H5.6c-3.08,0-5.6-2.52-5.6-5.6V5.6 C0,2.52,2.52,0,5.6,0L5.6,0z"></path>' +
      "</svg>"
  );
}

export function getStopSvgwithText(text: any) {
  return encodeURIComponent(
    `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="10" fill="red" stroke="black" stroke-width="1" />
      <text x="15" y="16" font-size="10" fill="white" text-anchor="middle" alignment-baseline="middle">${text}</text>
    </svg>`
  );
}
export function getStopSvgwithTextGreen(text: any) {
  return encodeURIComponent(
    `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="10" fill="green" stroke="black" stroke-width="1" />
      <text x="15" y="16" font-size="10" fill="white" text-anchor="middle" alignment-baseline="middle">${text}</text>
    </svg>`
  );
}
export function formatDateString(inputDateString:any){
  const dateObject = new Date(inputDateString);
  const formattedDateString = dateObject.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
  return formattedDateString;
};