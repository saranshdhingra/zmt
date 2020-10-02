import _ from 'lodash';

export function getClassesFromObj(obj){
    return _(obj).pickBy(_.identity).keys().value().join(' ');
}

export default {
    getClassesFromObj:getClassesFromObj
};
