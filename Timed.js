function delay(ms, fn) {
    const end = Date.now() + ms;

    const id = setInterval(() => {
        if (Date.now() >= end) {
            clearInterval(id);
            fn(); // call the function you passed in
            
        }
    }, 10);
}

function timedDryBrickForm() {
    hide("dryBrickForm");
    delay(60000, dryBrickForm)
}