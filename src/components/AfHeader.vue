<template>
  <div class="gnb_wrap">
    <div class="search_area">
      <h3>
        <a href=".">검색</a>
      </h3>
      <fieldset>
        <legend>검색 폼</legend>
        <input type="text" v-model="keyword" name="szKeyword" id="szKeyword" title="검색어 입력" class="search_bar" @keyup="autoJaso" @click="autoJaso" />
        <a title="검색" class="btn_search" @click="search(keyword)">검색</a>
        <!-- 자동 완성 -->
        <div class="sear_auto" id="divSearchAuto" v-if="auto" v-click-outside="hide">
          <ul>
            <li v-for="oData in list" v-bind:key="oData">
              <a :href="searchUrl(oData.d)">{{oData.d}}</a>
            </li>
          </ul>
        </div>
        <!-- 최근 검색어 -->
        <div class="mysch" v-if="mysch" v-click-outside="hide">
          <p class="stitle">최근 검색어</p>
          <ul v-for="szKey in list" v-bind:key="szKey">
            <li>
              <a :href="searchUrl(szKey)">
                <span class="tit">{{ szKey }}</span>
              </a>
              <button class="del" @click="deleteKeyword(szKey)"></button>
            </li>
          </ul>
          <p class="alldel"><a href="javascript:void(0);" @click="deleteCookie('_csk')">전체삭제</a></p>
        </div>
        <!-- 실시간 검색어 -->
        <div class="livesch" v-if="!mysch && live" v-click-outside="hide">
          <p class="stitle">실시간 인기 검색어</p>
          <ul v-for="(oData, nIndex) in list" v-bind:key="oData">
            <li>
              <a :href="searchUrl(oData.keyword)">
              <em>{{ (nIndex+1) }}</em>
              <span class="tit">{{ oData.keyword }}</span>
              <span class="rank">
                <span :class="liveKeywordList(oData.updown, oData.show_text)">{{ oData.show_text }}</span>
              </span>
              </a>
            </li>
          </ul>
        </div>
      </fieldset>
    </div>
    <div id="menu">
      <ul class="menu text">
        <li :class="$store.state.onTab.totalSearch" id="li_total">
          <router-link :to="tabMoveLink('')">통합검색</router-link>
        </li>
        <li :class="$store.state.onTab.live" id="li_broad">
          <router-link :to="tabMoveLink('live')">생방송</router-link>
        </li>
        <li :class="$store.state.onTab.vod" id="li_video">
          <router-link :to="tabMoveLink('vod')">VOD</router-link>
        </li>
        <li :class="$store.state.onTab.post" id="li_posts">
          <router-link :to="tabMoveLink('post')">게시글</router-link>
        </li>
        <li :class="$store.state.onTab.bj" id="li_bj">
          <router-link :to="tabMoveLink('bj')">BJ</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'afHeader',
  data () {
    return {
      list: '',
      mysch: false,
      auto: false,
      live: false,
      keyword: '',
      ticket: ''
    }
  },
  methods: {
    autoJaso (e) {
      let szKeyword = e.target.value
      if (!szKeyword) {
        this.checkKeyword()
        return false
      }
      // 방향키
      var aDirectionCode = [37, 38, 30, 40]
      if (aDirectionCode.includes(e.which)) {
      } else if (e.which === 13) {
        this.search(e.target.value)
      } else {
        let params = {}
        params['m'] = 'autoJaso'
        params['v'] = '1.0'
        params['t'] = 'json'
        params['c'] = 'UTF-8'
        params['d'] = e.target.value
        params['n'] = 10
        params['w'] = 'webk'

        this.$http.get('//scketc.afreecatv.com/api.php', {
          params: params
        }).then((res) => {
          this.list = res.data.list
          this.live = false
          this.mysch = false
          this.auto = true
        })
      }
    },
    liveKeyword (szKeyword) {
      let params = {}
      params['m'] = 'hotKeyword'
      params['v'] = '1.0'
      params['t'] = 'json'
      params['c'] = 'UTF-8'

      this.$http.get('//scketc.afreecatv.com/api.php', {
        params: params
      }).then((res) => {
        this.list = res.data.HOT
        this.auto = false
        this.mysch = false
        this.live = true
      })
    },
    search (keyword) {
      // 최근 검색어 추가
      this.sckCookie(keyword, 'add')
      // 검색
      location.href = '?keyword=' + keyword
    },
    setting () {
      // 키워드 세팅
      this.keyword = this.$route.query.keyword
      // 탭 세팅
      let szTab = this.$route.path.replace('/', '')
      szTab = szTab === '' ? 'totalSearch' : szTab
      this.$store.dispatch('callSetCurrentTab', { tab: szTab })
      // 접속 ID 세팅
      let aUserInfo = this.$cookies.get('PdboxUser').split('&')

      let aUserId = aUserInfo[0].split('=')
      this.$store.dispatch('callSetUserId', { userId: aUserId[1] })
    },
    searchUrl (szKeyword) {
      return '?keyword=' + encodeURIComponent(szKeyword)
    },
    checkKeyword () {
      try {
        if (this.recentKeyword()) {
        } else {
          this.liveKeyword()
        }
      } catch (e) { // catches a malformed URI
        console.log(e)
      }
    },
    recentKeyword () {
      let szCKKeyword = this.getCookie('_csk')

      // 최근 검색어 구분자
      let szReg = String.fromCharCode(12)

      if (szCKKeyword && szCKKeyword.trim() !== '') {
        let aData = szCKKeyword.split(szReg)
        this.list = aData
        this.live = false
        this.auto = false
        this.mysch = true
        return true
      } else {
        return false
      }
    },
    liveKeywordList (szUpdown, szShowText) {
      if (szUpdown === 'up' || szUpdown === 'down') {
        return szUpdown
      } else {
        if (szShowText === 'new') {
          return szShowText
        } else {
          return szShowText
        }
      }
    },
    deleteKeyword (keyword) {
      this.sckCookie(keyword, 'delete')
      this.checkKeyword()
    },
    deleteCookie (szKey) {
      var expireDate = new Date()
      expireDate.setDate(expireDate.getDate() - 1)
      this.setCookie('_csk', '', '.afreecatv.com', expireDate)
      this.checkKeyword()
    },
    hide () {
      this.auto = false
      this.live = false
      this.mysch = false
    },
    tabMoveLink (type) {
      return {
        path: '/' + type,
        query: {
          keyword: this.keyword
        }
      }
    },
    getCookie (name) {
      let srch = name + '='
      if (document.cookie.length > 0) {
        let offset = document.cookie.indexOf(srch)
        if (offset !== -1) {
          offset += srch.length
          let end = document.cookie.indexOf(';', offset)
          if (end === -1) {
            end = document.cookie.length
          }
          return unescape(document.cookie.substring(offset, end))
        } else {
          return false
        }
      } else {
        return false
      }
    },
    setCookie (name, value, domain, expiredays) {
      var todayDate = new Date()
      todayDate.setDate(todayDate.getDate() + expiredays)
      document.cookie = name + '=' + escape(value) + '; path=/; expires=' + todayDate.toGMTString() + '; domain=' + domain + ';'
    },
    sckCookie (szKeyword, szMode) {
      let szCKKeyword = this.getCookie('_csk')
      if (szCKKeyword === null) {
        szCKKeyword = ''
      }

      let expireDate = new Date()
      expireDate.setDate(expireDate.getDate() - 1)

      let szReg = String.fromCharCode(12)

      szCKKeyword = unescape(szCKKeyword)
      if (szKeyword) {
        let aData = []
        if (szCKKeyword !== '') {
          aData = szCKKeyword.split(szReg)

          aData.forEach(function (szKey) {
            if (szKey === szKeyword) {
              aData.splice(szKey, 1)
            }
          })
        }
        let aSaveData = ''
        aSaveData = (szMode === 'delete' ? [].concat(aData) : [szKeyword].concat(aData))
        szCKKeyword = aSaveData.join(szReg)
      }

      if (szCKKeyword === szReg) {
        // 구분자만 남았을때  키 삭제[_csk]
        this.deleteCookie('_csk')
      }

      this.setCookie('_csk', szCKKeyword, '.afreecatv.com', expireDate)
    }
  },
  created: function () {
    this.setting()
  },
  mounted: function () {
    // this.$el.addEventListener('click', this.hide)
  },
  beforeDestroy: function () {
    // this.$el.removeEventListener('click', this.hide)
    // document.removeEventListener('click', this.onClick)
  }
}
</script>

<style>
#header {
  height: 50px;
  width:100%;
  margin:0 auto;
  padding-bottom:2px;
}
.thema_dark #search #header {
  border-bottom: 0 solid #000;
  padding-bottom: 2px;
}
body.thema_dark #search_content .search_area h3, body.thema_dark #search_content .search_area h3 a {
    color: #fff;
}
.thema_dark #search_content .search_area h3, .thema_dark #search_content .search_area h3 a {
    float: left;
    background: none;
    padding: 0;
    text-indent: 0;
    color: #0f0f0f;
    line-height: normal !important;
    font-size: 32px;
    font-family: 'ng';
    letter-spacing: -2px;
    text-decoration: none;
    width: 70px;
}
#header h1 {
  display: block;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  background: url(//www.afreecatv.com/images/svg/logo.svg) 0 50% no-repeat;
  width: 96px;
  height: 50px;
  margin: 0;
}
.gnb_wrap {
  border-bottom: 1px solid #4279ff;
}
.thema_dark .gnb_wrap {
  background: #1b1b1c;
  border-bottom: 1px solid #000;
}
.search_area {
  position: relative;
  width: 960px;
  height: 37px;
  margin: 0 auto 0;
  margin-bottom: 20px;
}
.img_thum img {
  length: 150px;
}
#menu {
  margin: 0 auto 0;
  margin-top: 10px;
}
#menu .menu.text li a,
#menu .menu.text li a:active,
#menu .menu.text li a:visited {color:#999999}
#menu .menu.text li.on a{color:#7389ff; border-bottom: 4px solid #7389ff;}
#menu .menu.text li a:hover .target_blank{color:#7389ff}

#menu {position:relative;clear:both;width:960px;}
#menu .evt{position:absolute; left:400px; top:-4px}
#menu .frontier{position:absolute; left:338px; top:11px}
#menu img {vertical-align:top}
#menu .menu {float:left;padding:0 0 0 0;}
#menu .menu li {float:left;/*height:39px*/}
#menu .menu li.floatR { float:right; }
#menu .menu li.floatR img {margin-top:2px;}
#menu .menu li.on {height:73px}
#menu .menu li.nsb {height:35px}
#menu .menu li.cast {margin-left:10px}
#menu .menu li.bar {margin-left:5px; padding-left:7px; background:url(/images/gnb_new/bul_bar.gif) no-repeat 0 10px}
#menu .menu li.line{background:url(/images/gnb_new/case_line.gif) left 0 no-repeat;padding-left:1px;margin-left:10px;padding-left:10px}
#menu .menu li.tv_game {position:absolute; right:12px;top:0;}
#menu .menu li.bn_prm_15 {display: block;position: absolute;right: 0;top: -15px;} /* 2016-01-13 sports gnb에 배너 삽입시 필요한 class 입니다 삭제 하제마세요. 기존에 삭제 되어있어 추가 했습니다. */
#menu .menu li.bn_prm {display: block;position: absolute;right: 0;top: 0;}
#menu .menu li .ic_new {position:absolute;top:-7px;width:0;display:none} /* new표시 inline css로 left:**px 조절 */
#menu .menu li.btn_r {position:absolute;top:0;right:0}
#menu .sub {position:absolute;width:960px;top:42px;left:0px; margin:0; padding:0;}
#menu .sub li {float:left; height:24px; margin-right:2px;background:url(/images/gnb_new/sub_bar.gif) 0 9px no-repeat;overflow:hidden;margin-left:-1px}
#menu .sub li:first-child{background:none}
#menu .sub li a{display:block;padding:7px 10px 7px 10px;margin-left:1px;}
#menu .sub li img {vertical-align:top}
#menu .menu.text {float:none; overflow:hidden; margin:0;}
#menu .menu.text li { height: 35px; }
#menu .menu.text li a {display: block;height: 33px;padding: 2px 10px 0;font-size: 16px;line-height:16px;font-weight: bold;font-family: 'NG', verdana, applegothic, sans-serif;text-decoration: none;letter-spacing: -1px;color:#333;}
#menu .menu.text li .target_blank { display: inline-block; width: 0; height: 0; margin: 0 0 0 5px; vertical-align: 2px;  *vertical-align: 5px;  border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 3px solid #999; }
#menu .menu.text li a:active,
#menu .menu.text li a:visited {color:inherit; color: #333; }
#menu .menu.text li a:hover {color:#4279ff;}
#menu .menu.text li a:hover .target_blank { border-left-color:#4279ff;}
#menu .menu.text li.on a{height: 30px;margin-bottom: -1px;color: #4279ff;border-bottom: 4px solid #4279ff;}

/*어두운 모드*/
.thema_dark > p.stitle {color: #c8c8c8;border-bottom: 1px solid #1d1d1d;}
.thema_dark #search_content #menu .menu.text li a {color: #c8c8c8;}
.thema_dark #search_content #menu .menu.text li .target_blank { display: inline-block; width: 0; height: 0; margin: 0 0 0 5px; vertical-align: 2px;  *vertical-align: 5px;  border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 3px solid #999; }
.thema_dark #search_content #menu .menu.text li a:active,
.thema_dark #search_content #menu .menu.text li a:visited {color:inherit; color: #333; }
.thema_dark #search_content #menu .menu.text li a:hover {color:#4279ff;}
.thema_dark #search_content #menu .menu.text li a:hover .target_blank { border-left-color:#4279ff;}
.thema_dark #search_content #menu .menu.text li.on a{height: 30px;margin-bottom: -1px;color: #4279ff;border-bottom: 4px solid #4279ff;}
</style>
