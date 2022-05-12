// 设置axios的基地址
axios.defaults.baseURL = 'https://autumnfish.cn'

let app = new Vue({
    el: '#app',
    data: {
        searcher: 'LinKinPark',
        musicList: [],
        singer: '',
        songName: '',
        songUrl: '',
        songPic: '',
        songIndex: '',
        isPlay: false,
        showMv: false,
        mvUrl: '',
        nameScroll: true
    },

    methods: {
        // 关键字搜索
        searchMusic: function () {
            let that = this;
            if (this.searcher == 0) {
                that.searcher = '';
                return;
            }

            axios.get('/search?keywords=' + this.searcher)
                .then(function (response) {
                    that.searcher = '';
                    that.musicList = response.data.result.songs;
                }).catch(function () {
                    console.log('no such song');
                })
        },

        // 播放音乐
        playMusic: function (musicId, index) {
            // 此时的this指向的是app这个vue对象
            let that = this;
            that.songIndex = index; //获取此歌曲在musicList中的位置，以便上下一首
            // 获取歌曲地址
            axios.get('/song/url?id=' + musicId)
                .then(response => {
                    that.songUrl = response.data.data[0].url;
                })
            // 获取歌曲详情
            axios.get('/song/detail?ids=' + musicId)
                .then(response => {
                    that.songName = response.data.songs[0].name;
                    that.singer = response.data.songs[0].ar[0].name;
                    that.songPic = response.data.songs[0].al.picUrl;
                })
            this.scrollMusicName()
        },

        prevSong: function () {
            let that = this;
            if (that.songIndex > 0) {
                let nowSong = that.musicList[that.songIndex - 1];
                this.playNext_OR_PrevSong(that, nowSong);
                that.songIndex--;
            }
        },
        nextSong: function () {
            let that = this;
            if (that.songIndex < that.musicList.length - 1) {
                let nowSong = that.musicList[that.songIndex + 1];
                this.playNext_OR_PrevSong(that, nowSong);
                that.songIndex++;
            }
        },
        playNext_OR_PrevSong: function (that, nowSong) {
            axios.get('/song/url?id=' + nowSong.id)
                .then(response => {
                    that.songUrl = response.data.data[0].url;
                })
            // 获取歌曲详情
            axios.get('/song/detail?ids=' + nowSong.id)
                .then(response => {
                    that.songName = response.data.songs[0].name;
                    that.singer = response.data.songs[0].ar[0].name;
                    that.songPic = response.data.songs[0].al.picUrl;
                })
        },

        musicPlay: function () {
            if (!this.songUrl) {
                console.log('no Song');
                return;
            }
            this.isPlay = true;
            this.mvUrl = '';
            this.$refs.audio.play();
        },
        musicPaused: function () {
            this.isPlay = false;
            this.$refs.audio.pause();

        },
        mvPlay: function (mvId) {
            if (!mvId) {
                return;
            }
            let that = this;
            that.showMv = true;
            axios.get('/mv/url?id=' + mvId).then(function (response) {
                /*
                $refs定位不到的主要原因是因为v-if、 v-for、v- show这些语句如果依赖父组件传来的参数的话，
                该参数是在mounted() 阶段子还没获取得到
                如果想要真正地在DOM加载完成后拿到数据，就需要调用VUE的全局api： this.$nextTick(() => {})
                https: //www.cnblogs.com/pengshengguang/p/7929367.html
                */
                that.$nextTick(function () {
                    this.$refs.audio.pause();

                })
                that.mvUrl = response.data.data.url;
                console.log(that.mvUrl);
            })
        },
        closeMv: function () {
            this.showMv = false;
            this.mvUrl = ''
        },
        scrollMusicName: function () {
            let that = this;
            if (that.$refs.musicName.clientWidth > 2.35 * parseInt(document.querySelector('html').style.fontSize)) {
                that.nameScroll = true
            } else {
                that.nameScroll = false
            }
        }
    }
})

window.onload = function () {
    app.searchMusic()
}



/*
  1:歌曲搜索接口
    请求地址:https://autumnfish.cn/search
    请求方法:get
    请求参数:keywords(查询关键字)
    响应内容:歌曲搜索结果

  2:歌曲url获取接口
    请求地址:https://autumnfish.cn/song/url
    请求方法:get
    请求参数:id(歌曲id)
    响应内容:歌曲url地址
  3.歌曲详情获取
    请求地址:https://autumnfish.cn/song/detail
    请求方法:get
    请求参数:ids(歌曲id)
    响应内容:歌曲详情(包括封面信息)
  4.热门评论获取
    请求地址:https://autumnfish.cn/comment/hot?type=0
    请求方法:get
    请求参数:id(歌曲id,地址中的type固定为0)
    响应内容:歌曲的热门评论
  5.mv地址获取
    请求地址:https://autumnfish.cn/mv/url
    请求方法:get
    请求参数:id(mvid,为0表示没有mv)
    响应内容:mv的地址
*/