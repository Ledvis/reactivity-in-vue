let watchingFunc = null;

function watcher(target) {
  watchingFunc = target;
  target();
  watchingFunc = null;
}

function observe(data) {
  const subscribers = {};

  return new Proxy(data, {
    get(obj, key) {
      if (watchingFunc) {
        if (!subscribers[key]) subscribers[key] = [];
        subscribers[key].push(watchingFunc);
      }
      return obj[key];
    },
    set(obj, key, value) {
      obj[key] = value;
      if (subscribers[key]) subscribers[key].forEach(cb => cb());
    }
  });
}

const data = observe({
  dinner: 100,
  tip: 10,
  total: 0
});
const methods = {
  incrementDinnerPrice: () => data.dinner++,
  decrementDinnerPrice: () => data.dinner--,
  incrementTip: () => data.tip++,
  decrementTip: () => data.tip--
};

watcher(() => (data.total = data.dinner + data.tip));

watcher(() => {
  document.querySelector("#app").innerHTML = `
    <table>
      <tr>
        <td>Dinner: </td><td>${data.dinner} $</td>
        <td>
          <button @click="incrementDinnerPrice">+</button>
          <button @click="decrementDinnerPrice">-</button>
        </td>
      </tr>
      <tr>
        <td>Tip: </td><td>${data.tip} $</td>
        <td>
          <button @click="incrementTip">+</button>
          <button @click="decrementTip">-</button>
        </td>
      </tr>
      <tr>
        <td>Total: </td><td>${data.total} $</td>
      </tr>
    </table>
  `;
});

document.getElementById("app").addEventListener("click", ({ target }) => {
  const methodName = target.attributes["@click"].value;
  const method = methods[methodName];

  if (method) method();
});
