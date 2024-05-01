browser.runtime.onMessage.addListener((payload) => {
    if (payload.cmd === 'getPosition') {
        // get the street view panorama root element
        doc = window.wrappedJSObject.document;
        panoElem = doc.querySelector("div[data-qa='panorama']");
        // browser.runtime.sendMessage({content: panoElem});
        // return

        // get react fiber for the panorama root React component
        fiber = Object.keys(panoElem).find((key)=>{return key.includes('__reactFiber');});

        // get the first hook in the linked list of React hooks
        state = panoElem[fiber].return.memoizedState;

        // traverse the linked list until we find one like {current: {instance: [streetview api object instance]}}
        // and save the api object to the 'streetView' variable
        while (state.memoizedState?.current?.instance == null) { 
            state = state.next;
        }
        streetView = state.memoizedState.current.instance;
        console.log("got streetview obj");
        console.log(streetView);
        var position = {
            heading: streetView.pov.heading,
            pitch: streetView.pov.pitch,
            zoom: streetView.pov.zoom,
            panoId: streetView.pano,
            countryCode: null,
            stateCode: null,
            lat: streetView.position.lat(),
            lng: streetView.position.lng()
        }
        payload['response'] = position;
    }
    browser.runtime.sendMessage(payload);
});
