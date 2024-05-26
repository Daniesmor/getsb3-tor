const axios = require('axios');
const SocksProxyAgent = require('axios-socks5-agent');

const { SocksProxyAgent } = require('axios-socks5-agent');

const agent = new SocksProxyAgent({
    protocol: 'socks5',
    host: 'localhost',
    port: 9050
});

const ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/';
const PROJECT_SERVER_SB2 = 'https://cdn.projects.scratch.mit.edu/';
const PROJECT_SERVER_SB3 = 'https://projects.scratch.mit.edu/';

import VirtualMachine from 'scratch-vm';
import ScratchStorage from 'scratch-storage';

const collecteyData = {assets: {}};
    

async function getProjectUrlSb2(asset) {
    const assetIdParts = asset.assetId.split('.');
    const assetUrlParts = [PROJECT_SERVER_SB2, 'internalapi/project/', assetIdParts[0], '/get/'];
    if (assetIdParts[1]) {
        assetUrlParts.push(assetIdParts[1]);
    }
    const url = assetUrlParts.join('');
    const response = await axios.get(url, { httpAgent: agent, httpsAgent: agent });
    collecteyData.projectJSON = response.data;
    return response.data;
};


async function getProjectUrlSb3(asset) {
    const assetIdParts = asset.assetId.split('.');
    const assetUrlParts = [PROJECT_SERVER_SB3, assetIdParts[0], '/get/'];
    if (assetIdParts[1]) {
        assetUrlParts.push(assetIdParts[1]);
    }
    const url = assetUrlParts.join('');
    const response = await axios.get(url, { httpAgent: agent, httpsAgent: agent });
    collecteyData.projectJSON = response.data;
    return response.data;
};
    

async function getAssetUrl(asset) {
    const assetUrlParts = [
        ASSET_SERVER,
        'internalapi/asset/',
        asset.assetId,
        '.',
        asset.dataFormat,
        '/get/'
    ];
    const url = assetUrlParts.join('');
    const response = await axios.get(url, { httpAgent: agent, httpsAgent: agent });
    collecteyData.assets[asset.assetId] = response.data;
    return response.data;
};
    

function downloadJsonProject(projectId) {

    // const zip = new JSZip();
    // zip.file('project.json', projectJson);
    // zip.generateAsync({type:"blob"}).then(function (blob) { 
    //         saveAs(blob, projectId.concat('.zip'));                          
    // }, function (err) {
    //     console.log(err);
    // });
    
    return projectId;    
}


async function getJsonProject(projectId) {
    const vm = new VirtualMachine();
    const storage = new ScratchStorage();

    const AssetType = storage.AssetType;
    storage.addWebStore([AssetType.Project], getProjectUrlSb2);
    storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
    vm.attachStorage(storage);

    try {
        const projectAsset = await storage.load(storage.AssetType.Project, projectId);
        await vm.loadProject(projectAsset.data);
        return vm.toJSON();
    } catch (err) {
        storage.addWebStore([AssetType.Project], getProjectUrlSb3);
        storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
        vm.attachStorage(storage);

        const projectAsset = await storage.load(storage.AssetType.Project, projectId);
        await vm.loadProject(projectAsset.data);
        return vm.toJSON();
    }
}

module.exports = {getJsonProject};