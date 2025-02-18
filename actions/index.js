import TrackPlayer from 'react-native-track-player';
import _ from 'lodash';
import  RNAndroidAudioStore from 'react-native-get-music-files';

export const updateQuery = (query) => dispatch => {
  if(query){
    RNAndroidAudioStore.search({ searchParam: query }).then((media) => {
      _.map(media, function (item) {
        item.url = "file://" + item.path

        if (!item.id) {
          item.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        delete item.path
        item.artwork = 'https://source.unsplash.com/collection/574198/120x120'
        return item
      });
      dispatch({
        type: 'UPDATE_QUERY',
        payload: media,
        // query: query
      });
    })
    .catch((error) => {
      console.log(error)
    })
  }
  dispatch({
    type: 'UPDATE_QUERY',
    payload: [],
    // query: query
  });
}

export const updateTheme = (theme) => dispatch => {
  if(theme == "dark"){
    dispatch({
      type: 'UPDATE_THEME',
      payload: 'default'
    })
  }else {
    dispatch({
      type: 'UPDATE_THEME',
      payload: 'dark'
    })
  }
  
  
}

// const _downloadFileProgress = (data) => {
//   const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
//   const text = `Progress ${percentage}%`;
//   if (percentage == 100) {
//   }
// }


// export const downloadMedia = (item) => dispatch => {
//   try {
//     if(item){
//       RNFS.downloadFile({
//         fromUrl: item.url,
//         toFile: `${RNFS.DocumentDirectoryPath}/${item.title}.mp3`,
//         progress: (data) => _downloadFileProgress(data),
//       }).promise.then(() => {
//         dispatch({
//           type: 'DOWNLOAD',
//           payload: [{
//             title: item.title,
//             url: `${RNFS.DocumentDirectoryPath}/${item.title}.mp3`,
//             artwork: "https://raw.githubusercontent.com/YajanaRao/Serenity/master/assets/icons/app-icon.png",
//             artist: "Serenity"
//           }]
//         })
//       })
//     }
//   } catch (error) {
//   }
// }

export const getOfflineSongs = () => dispatch => {
  RNAndroidAudioStore.getAll({})
    .then(media => {
      _.map(media, function (item) {
        item.url = "file://" + item.path

        if (!item.id) {
          item.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        delete item.path
        // item.artwork = 'https://source.unsplash.com/collection/574198/120x120'
        return item
      });
      dispatch({
        type: 'OFFLINE',
        payload: media
      })
    })
    .catch(er => {
      dispatch({
        type: 'NOTIFY',
        payload: 'Something went wrong'
      })
    });
}


  

  // RNFS.readdir(RNFS.DocumentDirectoryPath).then(files => {
  //   let response = []
  //   _.forEach(files, function (value) {
  //     if (_.endsWith(value, 'mp3')){
  //       RNFS.exists(RNFS.DocumentDirectoryPath + '/' + value).then(() => {
  //         response.push({
  //           id: `file:/${RNFS.DocumentDirectoryPath}/${value}`,
  //           title: value.split('.')[0],
  //           url: `file:/${RNFS.DocumentDirectoryPath}/${value}`,
  //           artwork: "https://raw.githubusercontent.com/YajanaRao/Serenity/master/assets/icons/app-icon.png",
  //           artist: "Serenity"
  //         })
  //       })
  //     }
  //   });
  //   dispatch({
  //     type: 'OFFLINE',
  //     payload: response
  //   })
  // })
  // .catch (err => {
  // });
// }




export const playMedia = (item) => dispatch => {
  if(item){
    TrackPlayer.getCurrentTrack().then((trackId) => {
      if (!_.isNull(trackId) && trackId != item.id) {
        TrackPlayer.skip(item.id).then(() => {
          TrackPlayer.play();
          dispatch({
            type: 'PLAY',
            payload: item
          })
        })
        .catch((error) => { 
          if(!item.artwork || item.artwork == 'null' || _.isUndefined(item.artwork)){
            item.artwork = require('../assets/app-icon.png')
          }
          console.log(item.artwork)
          TrackPlayer.add(item,trackId).then(() => {
            TrackPlayer.skip(item.id)
            .then(() => {
              TrackPlayer.play();
              dispatch({
                type: 'PLAY',
                payload: item
              })
            })
            .catch((error) => {
              dispatch({
                type: 'NEXT'
              })
            })
          })
        })
      }else {
        TrackPlayer.add(item).then(() => {
          TrackPlayer.skip(item.id)
            .then(() => {
              TrackPlayer.play();
              dispatch({
                type: 'PLAY',
                payload: item
              })
            })
            .catch((error) => {
              TrackPlayer.skipToNext();
              dispatch({
                type: 'NOTIFY',
                payload: 'Something went wrong'
              })
            })
        })
      }
    })
    .catch((error) => {
      console.log(error)
    }) 
  }else {
    console.log("No data given")
  }
}

//  Favorite manangement
export const addToFavorite = (item) => dispatch => {
  if(!_.isUndefined(item)){
    dispatch({
      type: 'ADD_TO_FAVORITE',
      payload: item
    })
  }
}

export const removeFromFavorite = (item) => dispatch => {
  dispatch({
    type: 'REMOVE_FROM_FAVORITE',
    payload: item
  })
}

export const addToQueue = (song) => dispatch => {
  TrackPlayer.getQueue().then((queue) => {
    let update = [];
    if(_.isArray(song)){
      update = _.differenceBy(song, queue, 'id');
    }
    else{
      update = _.differenceBy([song], queue, 'id');
    }
    if(!_.isEmpty(update)){
      TrackPlayer.add(update);
      TrackPlayer.play();
      dispatch({
        type: 'ADD_QUEUE',
        payload: _.concat(queue, update)
      })
    }else {
      dispatch({
        type: 'NOTIFY',
        payload: 'Song is already present in the queue'
      })
    }
  })
  .catch((error) => {
    TrackPlayer.add(song);
    TrackPlayer.play();
    dispatch({
      type: 'NOTIFY',
      payload: 'Something went wrong'
    })
  })
}

export const removeFromQueue = (song) => dispatch => {
  TrackPlayer.remove(song).then(() => {
    TrackPlayer.getQueue().then((queue) => {
      dispatch({
        type: 'UPDATE_QUEUE',
        payload: queue
      })
    })
    
  })
}

export const clearQueue = () => dispatch => {
  TrackPlayer.reset();
  dispatch({
    type: 'CLEAR_QUEUE',
    payload: []
  })  
}

export const activeTrackUpdate = (trackId) => dispatch => {
  TrackPlayer.getTrack(trackId)
    .then((track) => {
      if (track) {
        dispatch({
          type: 'ACTIVE_TRACK_UPDATE',
          payload: track
        })
      }
    })
}

export const fetchTopAlbums = () => dispatch => {
  fetch('http://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=disco&api_key=fe67816d712b419bf98ee9a4c2a1baea&format=json&limit=20')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'TOP_ALBUMS',
        payload: responseJson.albums.album
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

export const fetchLastFMTopTracks = () => dispatch => {
  fetch('http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=cher&api_key=fe67816d712b419bf98ee9a4c2a1baea&format=json&limit=20')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'TOP_TRACKS',
        payload: responseJson.toptracks.track
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

export const fetchNapsterTopTracks = () => dispatch => {
  fetch('https://api.napster.com/v2.1/tracks/top?apikey=ZTk2YjY4MjMtMDAzYy00MTg4LWE2MjYtZDIzNjJmMmM0YTdm')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'TOP_TRACKS',
        payload: responseJson.tracks
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

export const fetchLastFMTopArtists = () => dispatch => {
  fetch('http://ws.audioscrobbler.com/2.2/?method=chart.gettopartists&api_key=fe67816d712b419bf98ee9a4c2a1baea&format=json&limit=20')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'TOP_ARTISTS',
        payload: responseJson.artists.artist
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

export const fetchNapsterTopArtists = () => dispatch => {
  fetch('https://api.napster.com/v2.2/artists/top?apikey=ZTk2YjY4MjMtMDAzYy00MTg4LWE2MjYtZDIzNjJmMmM0YTdm')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'TOP_ARTISTS',
        payload: responseJson.artists
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

export const fetchJioSavanData = (type) => dispatch => {
  try {
    fetch('https://www.jiosaavn.com/api.php?__call=content.getHomepageData')
      .then((response) => response.json())
      .then((responseJson) => {
        let response = responseJson._bodyInit.split("-->")[1]
        responseJson = JSON.parse(response.trim())
        if (type === "genres") {
          dispatch({
            type: 'JIO_SAVAN_GENRES',
            payload: responseJson.genres
          })
        }
        else if (type === "charts") {
          dispatch({
            type: 'JIO_SAVAN_CHARTS',
            payload: responseJson.charts
          })
        }
        else if (type === "new_albums") {
          dispatch({
            type: 'JIO_SAVAN_NEW_ALBUMS',
            payload: responseJson.new_albums
          })
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
  }
}

export const fetchKannadaTopSongs = () => dispatch => {
  fetch('http://192.168.0.11:5000/api/songs/top/week')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'TOP_KANNADA',
        payload: responseJson
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

export const fetchBillboardHot100 = () => dispatch => {
  fetch('http://192.168.0.11:5000/api/songs/top/billboard')
    .then((response) => response.json())
    .then((responseJson) => {
      dispatch({
        type: 'HOT_100',
        payload: responseJson.entries
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

