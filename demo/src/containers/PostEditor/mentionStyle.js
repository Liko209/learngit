/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-12 13:18:31
 * Copyright © RingCentral. All rights reserved.
 */
export default {
  control: {
    backgroundColor: '#fff',

    fontSize: 12,
    fontWeight: 'normal',
    flex: 1
  },

  highlighter: {
    overflow: 'hidden'
  },

  input: {
    margin: 0
  },

  '&singleLine': {
    control: {
      display: 'inline-block',

      width: 130,
      margin: '0px 30px 5px'
    },

    highlighter: {
      padding: 1,
      border: '2px inset transparent'
    },

    input: {
      padding: 1,

      border: '2px inset'
    }
  },

  '&multiLine': {
    control: {
      fontFamily:
        'proxima-nova,"Helvetica Neue",HelveticaNeue,Helvetica,Arial,sans-serif!important',

      border: '1px solid silver',
      margin: '0px 30px 10px 0',
      borderRadius: '5px'
    },

    highlighter: {
      padding: 9
    },

    input: {
      padding: 9,
      minHeight: 63,
      outline: 0,
      border: 0
    }
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 10,
      maxHeight: 100,
      overflow: 'auto',
      position: 'absolute',
      bottom: 14
    },

    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',

      '&focused': {
        backgroundColor: '#f80'
      }
    }
  }
};
