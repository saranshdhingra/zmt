import React from 'react';
import './SidebarFooter.scss';
import BrowserService from '../../services/BrowserService';
import http from '../../utils/http';
import Tooltip from '../tooltip/Tooltip';

class SidebarFooter extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            latestVersion: '-'
        };
    }
    async componentDidMount () {
        try {
            const response = await http.get('/releases');
            this.setState({ latestVersion: JSON.parse(response.data.versions).chrome });
        }
        catch (err) {
            console.log(err);
        }
    }

    render () {
        // eslint-disable-next-line no-undef
        const curVersion = BrowserService.getCurrentVersion(),
            latestVersion = this.state.latestVersion,
            githubLink = 'https://github.com/saranshdhingra/zmt';
        return (
            <div className={'sidebarFooter'}>
                Current Version: <span className={'version'}>{curVersion}</span><br />
                Latest version: <span className={'version'}>{latestVersion}</span>
                {
                    curVersion !== latestVersion &&
                    <Tooltip content={'Please update your extension by the method mentioned in the Dashboard.'} position='right' />
                }
                <br />
                <a className={'externalLink'} href={githubLink} target={'_blank'} rel={'noopener noreferrer'}>Github</a>
            </div>
        );
    }
}

export default SidebarFooter;
