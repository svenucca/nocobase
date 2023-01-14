import React from 'react';
import { Comment, Divider, Form, Button, Empty, Modal, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CommentBlockDesigner } from './CommentBlock.Designer';
import { useCommentTranslation } from '../locale';
import { CommentBlockDecorator } from './CommentBlock.Decorator';
import { useCollection, useCurrentUserContext, useRecord, useRequest, useResource } from '@nocobase/client';
import { createReg, StructMentions } from '../components/StructMentions';

let id = 0;

export interface User {
  nickname: string;
  id: number;
}

export interface CommentItem {
  id: string;
  commenter: User;
  commentUsers: User[];
  content: string;
}

export const CommentBlock = (props) => {
  const { t } = useCommentTranslation();
  const [form] = Form.useForm();

  const collection = useCollection();
  const record = useRecord();
  const { data: currentUserData } = useCurrentUserContext();

  let collectionName = collection.name;
  let recordId = record.id;

  if (props.from === 'commentRecord') {
    collectionName = record.collectioName;
    recordId = record.recordId;
  }

  const currentUserId = currentUserData.data.id;

  const { create, destroy } = useResource('comments');

  const { data, loading, refresh } = useRequest({
    resource: 'comments',
    action: 'list',
    params: {
      paginate: false,
      filter: {
        collectioName: collectionName,
        recordId: recordId,
      },
      sort: 'createdAt',
      appends: ['commenter', 'commentUsers'],
    },
  });

  const commentList = data?.data ?? [];

  const handleFinish = async () => {
    const formValues = form.getFieldsValue();

    const reg = createReg('.*?', 'g');
    const atIds = [];

    formValues.content.replace(reg, (match, p1) => atIds.push(~~p1));

    const commentUsers = Array.from(new Set([...atIds]));

    console.log({
      collectioName: collectionName,
      recordId: recordId,
      content: formValues.content,
      commenter: currentUserId,
      commentUsers,
    });

    await create({
      values: {
        collectioName: collectionName,
        recordId: recordId,
        content: formValues.content,
        commenter: currentUserId,
        commentUsers,
      },
    });
    form.resetFields();
    refresh();
  };

  const handleDelete = async (item: CommentItem) => {
    Modal.confirm({
      title: t('Delete comment'),
      content: t('Confirm delete?'),
      onOk: async () => {
        await destroy({
          filterByTk: item.id,
        });
        refresh();
      },
    });
  };

  const handleEdit = async (item: CommentItem) => {};

  return (
    <div>
      {!loading && commentList.length ? (
        commentList.map((i: CommentItem) => (
          <Comment
            key={i.id}
            avatar={<Avatar icon={<UserOutlined />} />}
            actions={[
              // <span key="comment-edit" onClick={() => handleEdit(i)}>
              //   {t('Edit')}
              // </span>,
              <span key="comment-delete" onClick={() => handleDelete(i)}>
                {t('Delete')}
              </span>,
            ]}
            author={<a>{i.commenter.nickname}</a>}
            content={<p>{getContent(i)}</p>}
          />
        ))
      ) : (
        <Empty description={t('No comments')} />
      )}
      <Divider />
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="content">
          <StructMentions />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            {t('Comment')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export const getContent = (item: CommentItem) => {
  const reg = createReg('.*?', 'g');
  const replaces = [];
  let plainText = item.content.replace(reg, (match, p1) => {
    const name = item.commentUsers.find((i) => i.id === ~~p1)?.nickname ?? p1;
    replaces.push(`@${name}`);
    return `@${name}`;
  });

  if (replaces.length) {
    let splits = [];
    for (let r of replaces) {
      const index = plainText.search(r);
      const before = plainText.slice(0, index);
      const main = <a key={id++}>{plainText.slice(index, index + r.length)}</a>;
      plainText = plainText.slice(index + r.length);
      splits.push(before, main);
    }
    splits.push(plainText);

    return splits.filter((i) => i);
  } else {
    return plainText;
  }
};

CommentBlock.Designer = CommentBlockDesigner;
CommentBlock.Decorator = CommentBlockDecorator;