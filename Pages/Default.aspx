<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
  <SharePoint:ScriptLink Name="sp.runtime.js"          runat="server" OnDemand="false" LoadAfterUI="true" Localizable="false" />
  <SharePoint:ScriptLink Name="sp.js"                  runat="server" OnDemand="false" LoadAfterUI="true" Localizable="false" />
  <SharePoint:ScriptLink Name="sp.workflowservices.js" runat="server" OnDemand="false" LoadAfterUI="true" Localizable="false" />

  <!-- SPA CSS references-->
  <link type="text/css" rel="stylesheet" href="../Content/bootstrap.min.css" />
  <link type="text/css" rel="stylesheet" href="../Content/bootstrap-responsive.min.css" />
  <link type="text/css" rel="stylesheet" href="../Content/font-awesome.min.css" />
  <link type="text/css" rel="stylesheet" href="../Content/toastr.min.css" />

  <!-- SPA JS references-->
  <script type="text/javascript" src="../Scripts/modernizr-2.6.2.js"></script>
  <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
  <script type="text/javascript" src="../Scripts/datajs-1.1.0.js"></script>
  <script type="text/javascript" src="../Scripts/linq.min.js"></script>
  <script type="text/javascript" src="../Scripts/bootstrap.min.js"></script>
  <script type="text/javascript" src="../Scripts/knockout-2.2.1.js"></script>
  <script type="text/javascript" src="../Scripts/toastr.min.js"></script>
  <script type="text/javascript" src="../Scripts/sammy-0.7.4.min.js"></script>
  <script type="text/javascript" src="../Scripts/moment.min.js"></script>

  <!-- my app -->
  <!-- HACK: VS SP2013 dev tools don't refresh App.min.*s files when debugging -->
  <!-- HACK: make sure to switch this to App.min.*s before deploy -->
  <link type="text/css" rel="stylesheet" href="../Content/App.css" /> 
  <script type="text/javascript" src="../App/models/core.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
  Learning Path Manager
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
  <div id="applicationHost">
    <div class="page-splash"></div>
    <div class="page-splash-message">
        Learning Path Manager
    </div>
    <div class="progress progress-striped active page-progress-bar">
        <div class="bar" style="width: 100%;"></div>
    </div>
  </div>
  <script type="text/javascript" src="../App/durandal/amd/require.js" data-main="../App/main"></script>
</asp:Content>