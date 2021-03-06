import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Popover, Modal, Table, Badge } from 'antd';

import EntryVotesContent from './EntryVotesContent';
import FormattedCurrency from './FormattedCurrency';

import parseToken from '../../utils/parse-token';
import parseDate from '../../utils/parse-date';
import authorReputation from '../../utils/author-reputation';

import AccountLink from '../helpers/AccountLink';

export const prepareVotes = entry => {
  const totalPayout =
    parseToken(entry.pending_payout_value) +
    parseToken(entry.total_payout_value) +
    parseToken(entry.curator_payout_value);

  const voteRshares = entry.active_votes.reduce(
    (a, b) => a + parseFloat(b.rshares),
    0
  );
  const ratio = totalPayout / voteRshares;

  return entry.active_votes
    .map(a => {
      const rew = a.rshares * ratio;

      return Object.assign({}, a, {
        reputation: authorReputation(a.reputation),
        reward: rew,
        time: parseDate(a.time),
        percent: a.percent / 100
      });
    })
    .sort((a, b) => {
      const keyA = a.reward;
      const keyB = b.reward;

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
};

class EntryVotes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      enabled: false
    };
  }

  enable = () => {
    this.setState({
      enabled: true
    });
  };

  showModal = () => {
    this.setState({
      modalVisible: true
    });
  };

  handleModalCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  afterModalClosed = () => {
    this.setState({
      enabled: false
    });
  };

  render() {
    const { entry, children } = this.props;
    if (entry.active_votes.length === 0) {
      // When content has no votes
      return children;
    }

    const { modalVisible, enabled } = this.state;

    let popoverProps = {};
    let votes = [];

    if (enabled) {
      votes = prepareVotes(entry);

      if (!modalVisible) {
        const popoverContent = (
          <EntryVotesContent {...this.props} votes={votes} />
        );
        popoverProps = { content: popoverContent };
      } else {
        popoverProps.visible = false;
      }
    }

    const clonedChildren = React.cloneElement(children, {
      onClick: this.showModal,
      onMouseEnter: this.enable
    });

    const modalTableColumns = [
      {
        title: <FormattedMessage id="entry-votes.author" />,
        dataIndex: 'voter',
        key: 'voter',
        width: 220,
        sorter: (a, b) => a.reputation - b.reputation,
        render: (text, record) => (
          <span>
            <AccountLink {...this.props} username={text}>
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                {text}
              </span>
            </AccountLink>{' '}
            <Badge
              count={record.reputation}
              style={{
                backgroundColor: '#fff',
                color: '#999',
                boxShadow: '0 0 0 1px #d9d9d9 inset'
              }}
            />
          </span>
        )
      },
      {
        title: <FormattedMessage id="entry-votes.reward" />,
        dataIndex: 'reward',
        key: 'reward',
        align: 'center',
        width: 150,
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.reward - b.reward,
        render: text => <FormattedCurrency {...this.props} value={text} />
      },
      {
        title: <FormattedMessage id="entry-votes.percent" />,
        dataIndex: 'percent',
        key: 'percent',
        align: 'center',
        width: 150,
        sorter: (a, b) => a.percent - b.percent,
        render: text => `${text.toFixed(1)}%`
      },
      {
        title: <FormattedMessage id="entry-votes.time" />,
        dataIndex: 'time',
        key: 'time',
        align: 'center',
        sorter: (a, b) => a.time - b.time,
        render: text => <FormattedRelative value={text} />
      }
    ];

    return (
      <Popover {...popoverProps}>
        {clonedChildren}
        <Modal
          visible={modalVisible}
          onCancel={this.handleModalCancel}
          afterClose={this.afterModalClosed}
          footer={false}
          width="80%"
          centered
          title={
            <FormattedMessage
              id="entry-votes.modal-title"
              values={{ n: votes.length }}
            />
          }
        >
          <Table
            dataSource={votes}
            columns={modalTableColumns}
            scroll={{ y: 300 }}
            rowKey="voter"
          />
        </Modal>
      </Popover>
    );
  }
}

EntryVotes.propTypes = {
  entry: PropTypes.shape({
    pending_payout_value: PropTypes.string.isRequired,
    total_payout_value: PropTypes.string.isRequired,
    curator_payout_value: PropTypes.string.isRequired,
    active_votes: PropTypes.array.isRequired
  }).isRequired,
  children: PropTypes.element.isRequired
};

export default EntryVotes;
