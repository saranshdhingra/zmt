import { observable, action } from 'mobx';

class UiStore {
    constructor () {
        this.openPage = 'settings';
    }
    @observable openPage;

    @action
    setOpenPage (key) {
        this.openPage = key;
    }


}
export default new UiStore();
