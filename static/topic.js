async function getQid(code) {
    let qid = await fetch(`api/quiz/getQid?code=${code}`)
        .then(r => {return r.json()})
        .catch(err => {return 0})
    return qid
}

async function showSameTopicQuiz(qid) {
    let quiz = await $.get(`api/quiz/same_topic?qid=${qid}`, (res) => {
        return res
    })
        .then(res => JSON.parse(res))

    $.each(quiz, function (key, ele){
        let div = 
            $('<div class="same_topic_quiz">')
                .attr('code', ele.code)
                .click(async (event) => {
                    let code = $(event.target).attr('code')
                    window.quiz_code = code
                    refreshQuizColor(window.quiz_code, 'quiz')
                    console.log(window.quiz_code)
                    let qid = await getQid(code)
                    if (qid) {
                        window.qid = qid
                        showPage(qid)
                        return
                    }
                    showNoQuizAlert('feedback', '目前題庫沒有這題，不好意思')
                    return
                })
                .html(ele.quiz_title)
        $('div.same_topic_quiz_field')
            .append(div)
    })
    $('div.same_topic_quiz_field')
        .prepend(
            $('<div>')
                .addClass('same_topic_quiz_title')
                .html(quiz[0].topic)
            )
}

function showNoQuizAlert(className, content) {
    let feedBackBox = $('<div>')
        .addClass(className)
        .html(content)
        .append(
            $('<div>')
                .addClass('ok')
                .click(ok)
                .html('好喔')
        )
        .append(
            $('<div>')
                .addClass('ok')
                .click(async (event) => {
                    console.log(quiz_code)
                    $(event.target)
                        .parent()
                        .remove()
                    window.quiz_code = $(`div[code="${window.quiz_code}"]`).next().attr('code')
                    if (!window.quiz_code) {
                        window.quiz_code = $('div.same_topic_quiz:first-child').attr('code')
                    }
                    await $(`div[code="${window.quiz_code}"]`)
                        .trigger('click')
                })
                .html('再下一題')
        )
        .appendTo($('body'))
        return

}

async function refreshQuizColor (code, type) {
    await $(`[code="${code}"]`)
        .siblings()
        .removeClass(`${type}_focus`)
        
    await $(`a.lv2_3_topic`)
        .removeClass(`${type}_focus`)

    await $(`[code="${code}"]`)
        .addClass(`${type}_focus`)
        console.log(code, type)
}

async function showTopic() {
    window.topic = await $.get('api/topic').then(r => JSON.parse(r))
    let lv1_topics = window.topic.filter(r => r.code.length === 3)
    let lv2_topics = window.topic.filter(r => r.code.length === 5)
    let lv3_topics = window.topic.filter(r => r.code.length === 7)
    let root = $('<ul>').addClass('accordion')
    let ul = $('<ul>').addClass('inner')
    let li = $('<li>')
    await lv1_topics.map(lv1_topic => {
         let lv1 =
             $('<a>')
                 .addClass('toggle')
                 .attr('code', lv1_topic.code)
                 .attr('href', "javascript:void(0)")
                 .click(async (event) => {
                     let code = $(event.target).attr('code')
                 })
                 .html(lv1_topic.topic)
         let lv2_wrapper = $('<div class="inner"></div>')
         let lv1_2_topics = lv2_topics.filter(topic => topic.code.includes(lv1_topic.code))
         lv1_2_topics.map(lv1_2_topic => {
             let lv2 =
                 $('<a>')
                     .addClass('toggle')
                     .attr('code', lv1_2_topic.code)
                     .attr('href', "javascript:void(0)")
                     .html(`&#127794; ${lv1_2_topic.topic}`)
                     .draggable({
                        appendTo: body,
                        helper: 'clone',
                        start: function(event) {
                             let t =$(event.target)
                             window.tree_code = t.attr('code')
                             window.treePlanted[window.tree_code] = {
                                code: t.attr('code'),
                                text: t.html()
                             }
                             console.log(window.tree_code)
                             console.log(window.curr_code)
                        }
                     })

                     let lv3_wrapper = $('<div class="inner"></div>')
                     let lv2_3_topics = lv3_topics.filter(topic => topic.code.includes(lv1_2_topic.code))
                     lv2_3_topics.map(lv2_3_topic => {
                         let lv3 =
                             $('<a>')
                                 .attr('code', lv2_3_topic.code)
                                 .attr('class', 'lv2_3_topic')
                                 .attr('href', "javascript:void(0)")
                                 .click(event, async () => {
                                     window.curr_code = $(event.target).attr('code').slice(0,5)
                                     console.log(window.curr_code)
                                     let code = $(event.target).attr('code')
                                     let qid = await getQid(code)
                                     console.log('topic', code)
                                     refreshQuizColor(code, 'topic')
                                     window.quiz_order_in_same_topic = 0
                                     showPage(qid)
                                 })
                                 .html(lv2_3_topic.topic)
                                 .after('<br>')
                                 lv3_wrapper.append(lv3)
                     })
                     lv2.after(lv3_wrapper)
                     lv2_wrapper.append(lv2)
         })
         lv1.after(lv2_wrapper)
         li.append(lv1)
     })
     $('div.topic_field').append(
         root.append(
             li.append(
                 ul
             )
         )
     )
     nestedList()
     refreshQuizColor(window.quiz_code.slice(0,-1), 'topic')
     await $(`[code="${window.quiz_code.slice(0,3)}"]`).trigger('click')
     await $(`[code="${window.quiz_code.slice(0,5)}"]`).trigger('click')
}

function nestedList() {
    $('.toggle').click(function(e) {
        e.preventDefault();
      
        var $this = $(this);
      
        if ($this.next().hasClass('show')) {
            $this.next().removeClass('show');
            $this.next().slideUp(350);
        } else {
            $this.parent().parent().find('li .inner').removeClass('show');
            $this.parent().parent().find('li .inner').slideUp(350);
            $this.next().toggleClass('show');
            $this.next().slideToggle(350);
        }
    });
}
