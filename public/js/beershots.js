

function doPubSearch (query , locationiq_key ) {
    if( checkPostCode(query)) {
        $.getJSON("https://api.postcodes.io/postcodes/" + encodeURI(query))
            .done((data) => {
                if( data.status===200 ) {
                    console.log("found");
                    window.location = '/pubs/' + data.result.latitude + '/' + data.result.longitude + '/';
                }
            });
    } else {
        $.getJSON("https://locationiq.org/v1/search.php?key=" + locationiq_key + "&countrycodes=gb&format=json&q=" + query)
            .done((data) => {
                const found = data[ 0 ];

                if (found !== undefined) {
                    window.location = '/pubs/' + data[ 0 ].lat + '/' + data[ 0 ].lon + '/';
                }
            });
    }
}