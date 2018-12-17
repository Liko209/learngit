/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 14:11:55
 * Copyright © RingCentral. All rights reserved.
 */
import i18next from 'i18next';
import Backend from 'i18next-xhr-backend';
import jsonFile from '../../../public/locales/en/translations.json';

i18next.use(Backend).init(
  {
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: jsonFile,
      },
    },
  },
  (err, t) => {},
);

i18next.loadLanguages('en', () => {});

describe('i18next-en', () => {
  it('i18next-en translations file', () => {
    expect(i18next.t('heading')).toEqual('heading');
    expect(i18next.t('description')).toEqual('description');

    expect(i18next.t('key1', { what: 'what', how: 'how' })).toEqual(
      'what is how',
    );
    expect(i18next.t('keyWithCount', { count: 1 })).toEqual('1 item');
    expect(i18next.t('keyWithCount_plural', { count: 10 })).toEqual('10 items');
    expect(i18next.t('Dashboard')).toEqual('Dashboard');
    expect(i18next.t('Messages')).toEqual('Messages');
    expect(i18next.t('Phone')).toEqual('Phone');
    expect(i18next.t('Meetings')).toEqual('Meetings');
    expect(i18next.t('Contacts')).toEqual('Contacts');
    expect(i18next.t('Calendar')).toEqual('Calendar');
    expect(i18next.t('Tasks')).toEqual('Tasks');
    expect(i18next.t('Notes')).toEqual('Notes');
    expect(i18next.t('Files')).toEqual('Files');
    expect(i18next.t('Settings')).toEqual('Settings');
    expect(i18next.t('SignIn')).toEqual('Sign in');
    expect(i18next.t('SignOut')).toEqual('Sign out');
    expect(i18next.t('CreateTeam')).toEqual('Create Team');
    expect(i18next.t('SendNewMessage')).toEqual('Send New Message');
    expect(i18next.t('networkDisconnected')).toEqual(
      'Network disconnected. Please try again when the network is resumed.',
    );
    expect(i18next.t('Plus')).toEqual('Plus');
    expect(i18next.t('Menu')).toEqual('Menu');
    expect(i18next.t('text')).toEqual('text');
    expect(i18next.t('me')).toEqual('me');
    expect(i18next.t('OK')).toEqual('OK');
    expect(i18next.t('Cancel')).toEqual('Cancel');
    expect(i18next.t('Back')).toEqual('Back');
    expect(i18next.t('Forward')).toEqual('Forward');
    expect(i18next.t('Done')).toEqual('Done');
    expect(i18next.t('today')).toEqual('Today');
    expect(i18next.t('yesterday')).toEqual('Yesterday');
    expect(i18next.t('PublicTeam')).toEqual(
      'Public Team (visible to any co-worker)',
    );
    expect(i18next.t('MembersMayPostMessages')).toEqual(
      'Allow members to post messages',
    );
    expect(
      i18next.t('addedToTeam', { inviter: 'Lip', newUser: 'Valor' }),
    ).toEqual('Lip added Valor to the team');
    expect(
      i18next.t('changeTeamName', {
        changer: 'Lip',
        oldValue: 'fail',
        value: 'ok',
      }),
    ).toEqual('Lip changed the team name from fail to ok');

    expect(i18next.t('joinTheTeam', { newUser: 'Lip' })).toEqual(
      'Lip joined the team',
    );
    expect(i18next.t('mentions')).toEqual('mentions');
    expect(i18next.t('bookmarks')).toEqual('bookmarks');
    expect(i18next.t('@mentions_title')).toEqual('@Mentions');
    expect(i18next.t('bookmarks_title')).toEqual('Bookmarks');
    expect(i18next.t('at')).toEqual('at');
    expect(i18next.t('tomorrow')).toEqual('tomorrow');
    expect(i18next.t('avatarnamesWithOthers', { count: 10 })).toEqual(
      ' and other 10 people',
    );
    expect(i18next.t('Attachments')).toEqual('Attachments');
    expect(i18next.t('repeatingEveryDay')).toEqual('repeating every day');
    expect(i18next.t('repeatingEveryWeekday')).toEqual(
      'repeating every weekday',
    );
    expect(i18next.t('repeatingEveryWeek')).toEqual('repeating every week');
    expect(i18next.t('repeatingEveryMonth')).toEqual('repeating every month');
    expect(i18next.t('repeatingEveryYear')).toEqual('repeating every year');
    expect(i18next.t('forDayTimes', { count: 10 })).toEqual('for 10 days');
    expect(i18next.t('forDayTimes_interval')).toEqual('(1){for one day};');
    expect(i18next.t('forWeekTimes', { count: 10 })).toEqual('for 10 weeks');
    expect(i18next.t('forWeekTimes_interval')).toEqual('(1){for one week};');
    expect(i18next.t('forWeekdailyTimes', { count: 10 })).toEqual(
      'for 10 weekdays',
    );
    expect(i18next.t('forWeekdailyTimes_interval')).toEqual(
      '(1){for one weekday};',
    );
    expect(i18next.t('forMonthlyTimes', { count: 10 })).toEqual(
      'for 10 months',
    );

    expect(i18next.t('forMonthlyTimes_interval')).toEqual(
      '(1){for one month};',
    );
    expect(i18next.t('forYearlyTimes', { count: 2 })).toEqual('for 2 years');
    expect(i18next.t('forYearlyTimes_interval')).toEqual('(1){for one year};');
    expect(i18next.t('until')).toEqual('until');
    expect(i18next.t('hideEventHistory')).toEqual('Hide');
    expect(i18next.t('showEventHistory')).toEqual('Show old');
    expect(i18next.t('download')).toEqual('Download');
    expect(i18next.t('expand')).toEqual('Expand');
    expect(i18next.t('collapse')).toEqual('Collapse');
    expect(i18next.t('contacts')).toEqual('Contacts');
    expect(i18next.t('WeWerentAbleToCreateTheTeamTryAgain')).toEqual(
      "We weren't able to create the team. Try again.",
    );

    expect(i18next.t('setStateFavorites')).toEqual('Add to Favorites');
    expect(i18next.t('setStateUnFavorites')).toEqual('Remove from Favorites');
    expect(i18next.t('setStatePublic')).toEqual('Change to Public Team');
    expect(i18next.t('setStatePrivate')).toEqual('Change to Private Team');
    expect(i18next.t('markFavoriteServerErrorContent')).toEqual(
      "We weren't able to favorite this conversation. Try again.",
    );
    expect(i18next.t('markUnFavoriteServerErrorContent')).toEqual(
      "We weren't able to remove this conversation from favorites. Try again.",
    );
    expect(i18next.t('markPublicServerErrorContent')).toEqual(
      "We weren't able to public this conversation. Try again.",
    );
    expect(i18next.t('markPrivateServerErrorContent')).toEqual(
      "We weren't able to private this conversation. Try again.",
    );
    expect(i18next.t('suggested people')).toEqual('suggested people');
    expect(i18next.t('team members')).toEqual('team members');
    expect(i18next.t('search')).toEqual('Search');
    expect(i18next.t('task')).toEqual('task');
    expect(i18next.t('video chat')).toEqual('video chat');
    expect(i18next.t('audio conference')).toEqual('audio conference');
    expect(i18next.t('note')).toEqual('note');
    expect(i18next.t('file')).toEqual('file');
    expect(i18next.t('file_plural')).toEqual('files');
    expect(i18next.t('snippet')).toEqual('snippet');
    expect(i18next.t('link')).toEqual('link');
    expect(i18next.t('link_plural')).toEqual('links');
    expect(i18next.t('event')).toEqual('event');
    expect(i18next.t('mail')).toEqual('mail');
    expect(i18next.t('mobile')).toEqual('mobile');
    expect(i18next.t('replied')).toEqual('replied');
    expect(i18next.t('shared')).toEqual('shared');
    expect(i18next.t('started')).toEqual('started');
    expect(i18next.t('updated')).toEqual('updated');
    expect(i18next.t('created')).toEqual('created');
    expect(i18next.t('delete')).toEqual('Delete');
    expect(i18next.t('deletePostTitle')).toEqual('Delete message');
    expect(i18next.t('deletePostContent')).toEqual(
      'Are you sure to delete this message? It is evitable.',
    );
    expect(i18next.t('via')).toEqual('via');
    expect(i18next.t('marked')).toEqual('marked');
    expect(i18next.t('completed')).toEqual('completed');
    expect(i18next.t('reassigned')).toEqual('reassigned');
    expect(i18next.t('assigned')).toEqual('assigned');
    expect(i18next.t('incomplete')).toEqual('incomplete');

    expect(
      i18next.t('verb-noun-adjectives', {
        verb: 'marked',
        noun: 'task',
        adjectives: 'incomplete',
      }),
    ).toEqual('marked task incomplete');

    expect(
      i18next.t('verb-noun-adjectives-user', {
        verb: 'marked',
        noun: 'task',
        adjectives: 'incomplete',
        user: 'Lip',
      }),
    ).toEqual('marked task incomplete for Lip');

    expect(
      i18next.t('verb-noun-numerals', {
        verb: 'check',
        noun: 'task',
        count: 10,
      }),
    ).toEqual('check task 10');

    expect(
      i18next.t('verb-noun', {
        verb: 'check',
        noun: 'task',
      }),
    ).toEqual('check task');

    expect(
      i18next.t('verb-noun-user', {
        verb: 'marked',
        noun: 'task',
        user: 'Lip',
      }),
    ).toEqual('marked task for Lip');

    expect(
      i18next.t('verb-article-noun', {
        verb: 'created',
        noun: 'task',
      }),
    ).toEqual('created task task');

    expect(
      i18next.t('verb-numerals-noun', {
        count: 2,
        verb: 'shared',
        noun: 'file',
      }),
    ).toEqual('shared 2 files');

    expect(
      i18next.t('verb-numerals-prepositions-noun', {
        verb: 'complete',
        noun: 'task',
        count: 10,
      }),
    ).toEqual('complete 10% of task');

    expect(i18next.t('teamMembers')).toEqual('Team members');
    expect(i18next.t('groupMembers')).toEqual('Group members');
    expect(i18next.t('checkMoreGroupOption')).toEqual(
      'Check more options you have with this group',
    );
    expect(i18next.t('checkMoreTeamOption')).toEqual(
      'Check more options you have with this team',
    );
    expect(i18next.t('copyGroupUrl')).toEqual("Copy group's url");
    expect(i18next.t('copyTeamUrl')).toEqual("Copy team's url");
    expect(i18next.t('copyProfileEmail')).toEqual('Copy Email');
    expect(i18next.t('copyProfileUrl')).toEqual('Copy Url');
    expect(i18next.t('Profile')).toEqual('Profile');
    expect(i18next.t('Guest')).toEqual('Guest');
    expect(i18next.t('Admin')).toEqual('Admin');
    expect(i18next.t('goToGroupConversation')).toEqual(
      'Go to the conversation with the group',
    );
    expect(i18next.t('goToTeamConversation')).toEqual(
      'Go to the conversation with team',
    );
    expect(i18next.t('Message')).toEqual('Message');
    expect(i18next.t('more')).toEqual('More');
    expect(i18next.t('close')).toEqual('Close');
    expect(i18next.t('company')).toEqual('Company');
    expect(i18next.t('location')).toEqual('Location');
    expect(i18next.t('department')).toEqual('Department');
    expect(i18next.t('ext')).toEqual('Ext');
    expect(i18next.t('directNumber')).toEqual('Direct Number');
    expect(i18next.t('email')).toEqual('Email');
    expect(i18next.t('linkedIn')).toEqual('LinkedIn');
    expect(i18next.t('webpage')).toEqual('Webpage');
    expect(i18next.t('copy')).toEqual('Copy');
    expect(i18next.t('NoInternetConnection')).toEqual('No Internet Connection');
    expect(i18next.t('SorryWeWereNotAbleToSendTheMessage')).toEqual(
      "Sorry, we weren't able to send the message. Try again.",
    );
    expect(i18next.t('SorryWeWereNotAbleToLikeTheMessage')).toEqual(
      "Sorry, we weren't able to like this message. Try again.",
    );
    expect(i18next.t('SorryWeWereNotAbleToUnlikeTheMessage')).toEqual(
      "Sorry, we weren't able to unlike this message. Try again.",
    );
    expect(i18next.t('SorryWeWereNotAbleToCloseTheConversation')).toEqual(
      "Sorry, we weren't able to close the conversation. Try again.",
    );
    expect(i18next.t('SorryWeWereNotAbleToRemoveYourBookmark')).toEqual(
      "Sorry, we weren't able to remove your bookmark. Try again.",
    );
    expect(i18next.t('SorryWeWereNotAbleToBookmarkThisMessage')).toEqual(
      "Sorry, we weren't able to bookmark this message. Try again.",
    );
    expect(i18next.t('messageLoadingErrorTip')).toEqual(
      "We weren't able to open this conversation.",
    );
    expect(i18next.t('tryAgain')).toEqual('Try again.');
    expect(i18next.t('assignee')).toEqual('Assignee');
    expect(i18next.t('due')).toEqual('Due');
    expect(i18next.t('edit')).toEqual('Edit post');
    expect(i18next.t('AboutRingCentral')).toEqual('About RingCentral');
    expect(i18next.t('NewActions')).toEqual('New Actions');
  });
});
