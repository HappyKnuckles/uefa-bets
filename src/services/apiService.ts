import * as api from '@/generated';
import { isPlatform } from '@ionic/vue';
let configuration;
if(isPlatform('android')){
    configuration = new api.Configuration({basePath: 'http://10.0.2.2:5111'});
}else configuration = new api.Configuration({ basePath: 'https://localhost:44320'});

const communityApi = new api.CommunityApi(configuration);
const userApi = new api.UserApi(configuration);
const betApi = new api.BetApi(configuration);
const gameApi = new api.GameApi(configuration);
const userCommunityApi = new api.UserCommunityApi(configuration);

export default {
    configuration, 
    communityApi,
    userApi,
    betApi,
    gameApi,
    userCommunityApi
}