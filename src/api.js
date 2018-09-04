import _ from 'lodash';
import jsonp from 'jsonp';

const baseURL = 'http://gamesbyemail.com/Games/GameMethods.aspx';

function callGameMethod(method, args = []) {
  const cacheArg = _.uniqueId();

  const url = new URL(baseURL);
  const params = {
    noCache: cacheArg,
    function: method,
    argCount: args.length,
    args: JSON.stringify(args),
  };
  Object.entries(params).forEach(([key, val]) =>
    url.searchParams.append(key, val)
  );

  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  jsonp(url.toString(), (err, data) => {
    if (err != null) {
      reject(err);
    } else {
      resolve(data);
    }
  });

  return promise;
}

export function getGame(id) {
  return callGameMethod('GetGame', [id]);
}

export function getChat(playerId, chatId, otherChatId) {
  return callGameMethod('GetChat', [
    playerId,
    [chatId, otherChatId].sort((a, b) => a - b).join(','),
  ]);
}

export function postChat(playerId, chatId, otherChatId, message) {
  return callGameMethod('PostChat', [
    playerId,
    [chatId, otherChatId].sort((a, b) => a - b).join(','),
    message,
  ]);
}
