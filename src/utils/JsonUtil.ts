export class JsonUtil {
    static toJson(message) {
        const currentTime = '2021-07-02 11:00:00';
        const dateTimeRegex = new RegExp('(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2}) UTC:');
        const matchArray = message.match(dateTimeRegex);
        const removedUtcMessage = message.replace(matchArray[0], '');
        const messages = removedUtcMessage.split(':');
        const timeSplit = messages.length>6? messages[5].trim().split(' '): [];
        const queryTime = timeSplit.length>1? (Number(timeSplit[0]) / 1000).toFixed(3): 0;
        const querySplitByUnnamed = message.split('\<unnamed\>\:');
        const querySplitByStatement = message.split('statement\:');
        const querySplit = querySplitByUnnamed.length > 1? querySplitByUnnamed: querySplitByStatement;

        return {
            "currentTime": currentTime,
            "userIp": messages[0].trim(),
            "user": messages[1].trim(),
            "pid": messages[2].trim().replace('[', '').replace(']', ''),
            "queryTime": queryTime,
            "query": querySplit[querySplit.length-1].trim()
        }
    }

}
