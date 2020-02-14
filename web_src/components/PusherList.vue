<template>
    <div class="container-fluid no-padding">
        <div class="alert alert-success alert-dismissible">
            <small>
                <strong><i class="fa fa-info-circle"></i> 提示 : </strong> 
                屏幕直播工具可以采用<a href="https://github.com/EasyDSS/EasyScreenLive" target="_blank"> EasyScreenLive <i class="fa fa-external-link"></i></a>，
                <span class="push-url-format">推流URL规则: rtsp://{ip}:{port}/{id}</span> ，
                例如 : rtsp://www.easydarwin.org:554/your_stream_id
            </small>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div> 

        <div class="box box-success">
            <div class="box-header">
                <h4 class="text-success text-center">推流列表</h4>           
                <form class="form-inline">
                    <div class="form-group pull-right">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="搜索" v-model.trim="query" @keydown.enter.prevent="doSearch" ref="search">
                            <div class="input-group-btn">
                                <button type="button" class="btn btn-default" @click.prevent="doSearch" >
                                    <i class="fa fa-search"></i>
                                </button>  
                            </div>                            
                        </div>
                    </div>                              
                </form>            
            </div>
            <div class="box-body">
                <el-table :data="pushers" stripe class="view-list" :default-sort="{prop: 'startAt', order: 'descending'}" @sort-change="sortChange">
                    <el-table-column prop="id" label="ID" min-width="120"></el-table-column>
                    <el-table-column prop="path" label="地址" min-width="240"></el-table-column>          
                    <el-table-column prop="transType" label="传输方式" min-width="100">
                      <template slot-scope="scope">
                        <span v-if="scope.row.transType == 'tcp'">TCP</span>
                        <span v-else>UDP</span>
                      </template>
                    </el-table-column>                            
                    <el-table-column prop="inBytes" label="上行流量" min-width="120" :formatter="formatBytes" sortable="custom"></el-table-column>
                    <el-table-column prop="outBytes" label="下行流量" min-width="120" :formatter="formatBytes" sortable="custom"></el-table-column>
                    <el-table-column prop="onlines" label="在线人数" min-width="100" sortable="custom"></el-table-column>
                    <el-table-column prop="startAt" label="开始时间" min-width="200" sortable="custom"></el-table-column>
                </el-table>          
            </div>
            <div class="box-footer clearfix">
                <el-pagination layout="prev,pager,next" class="pull-right" :total="total" :page-size="pageSize" :current-page="page" @current-change="pageChange"></el-pagination>
            </div>
        </div>               
    </div>
</template>

<script>
import prettyBytes from "pretty-bytes";

export default {
  props: {
    page: {
      type: Number,
      default: 1
    },
    q: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      query: "",
      sort: "startAt",
      order: "descending",
      pushers: [],
      total: 0,
      timer: 0,
      pageSize: 10
    };
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  },
  mounted() {
    this.query = this.q;
    this.$refs["search"].focus();
    this.timer = setInterval(() => {
      this.load();
    }, 3000);
  },
  methods: {
    load() {
      $.post("/stats/pushers", {
        q: this.q,
        start: (this.page - 1) * this.pageSize,
        limit: this.pageSize,
        sort: this.sort,
        order: this.order
      }).then(data => {
        this.total = data.total;
        this.pushers = data.rows;
      });
    },
    pageChange(page) {
      this.$router.push(`/pushers/${page}${this.q ? "?q=" + this.q : ""}`);
    },
    doSearch() {
      this.$router.push(
        `/pushers/${this.page}${this.query ? "?q=" + this.query : ""}`
      );
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order;
      this.load();
    },
    formatBytes(row, col, val) {
      if (val == undefined) return "-";
      return prettyBytes(val);
    }
  },
  beforeRouteEnter(to, from, next) {
    if (!to.params.page) {
      return next({
        path: `/pushers/1`,
        replace: true
      });
    }
    to.params.page = parseInt(to.params.page) || 1;
    to.params.q = to.query.q;
    return next();
  },
  beforeRouteUpdate(to, from, next) {
    if (!to.params.page) {
      return next({
        path: `/pushers/1`,
        replace: true
      });
    }
    to.params.page = parseInt(to.params.page) || 1;
    to.params.q = to.query.q;
    next();
    this.$nextTick(() => {
      this.query = this.q;
      this.load();
    });
  }
};
</script>

