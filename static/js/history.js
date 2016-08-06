var historyMgmt = {
  uiGetMessageList: function () {
    return document.getElementById('modal_chat_search').querySelector('.messages_list');
  },

  showChatHistorySearch: function (history) {
    var list = historyMgmt.uiGetMessageList();

    [].forEach.call(list.querySelectorAll('.messages_list_item'), function (msgItem) {
      list.removeChild(msgItem);
    });

    history.sort(chat.messageSort);

    history.forEach(function (data) {
      var li = roomMgmt.createDOMForMessage(data);

      list.insertAdjacentElement('beforeend', li);
    });

    launchModal('chat_search');
  }
};
