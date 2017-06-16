

function doPubSearch (query , locationiq_key ) {
    console.log("performing search:" + query);
    if( checkPostCode(query)) {
        console.log("It's a postcode");
        $.getJSON("http://api.postcodes.io/postcodes/" + encodeURI(query))
            .done(function (data) {
                if( data.status===200 ) {
                    console.log("found");
                    window.location = '/pubs/' + data.result.latitude + '/' + data.result.longitude + '/';
                }
            });
    } else {
        console.log("Looking for a place");
        $.getJSON("https://locationiq.org/v1/search.php?key=" + locationiq_key + "&countrycodes=gb&format=json&q=" + query)
            .done(function (data) {
                console.log("done:")
                console.log(data);
                var found = data[ 0 ];

                console.log(data);

                if (found != undefined) {
                    console.log("found");
                    window.location = '/pubs/' + data[ 0 ].lat + '/' + data[ 0 ].lon + '/';
                }
            });
    }
}