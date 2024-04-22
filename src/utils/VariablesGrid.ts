export namespace VariablesGrid {
  const time = document.querySelector("#variables .time .value");
  const acm = document.querySelector("#variables .acm .value");

  export function updateTime(str: string) {
    if (!time) throw Error("VariablesGrid: No 'time' HTML component");
    time.innerHTML = str;
  }

  export function updateAcm(str: string) {
    if (!acm) throw Error("VariablesGrid: No 'acm' HTML component");
    acm.innerHTML = str;
  }
}
