const btn = document.querySelector('.btn');

const debounce = (fn) => {
  let timeOutID;
  return () => {
    console.log(timeOutID);
    clearTimeout(timeOutID);
    timeOutID = setTimeout(() => {
      fn();
    }, 2000);
  };
};

btn.addEventListener(
  'click',
  debounce(() => console.log('you clicked me'))
);

//delay logic
//so it runs 2s after last click
//setTimeout return id, which pass into clearTimeout
