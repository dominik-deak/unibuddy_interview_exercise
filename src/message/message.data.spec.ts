import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { MessageData } from './message.data';
import { ChatMessageModel, ChatMessageSchema } from './models/message.model';

import { ConfigManagerModule } from '../configuration/configuration-manager.module';
import { getTestConfiguration } from '../configuration/configuration-manager.utils';

const id = new ObjectID('5fe0cce861c8ea54018385af');
const conversationId = new ObjectID();
const senderId = new ObjectID('5fe0cce861c8ea54018385af');
const sender2Id = new ObjectID('5fe0cce861c8ea54018385aa');
const sender3Id = new ObjectID('5fe0cce861c8ea54018385ab');

class TestMessageData extends MessageData {
  async deleteMany() {
    await this.chatMessageModel.deleteMany();
  }
}

describe('MessageData', () => {
  let messageData: TestMessageData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigManagerModule],
          useFactory: () => {
            const databaseConfig = getTestConfiguration().database;
            return {
              uri: databaseConfig.connectionString,
            };
          },
        }),
        MongooseModule.forFeature([
          { name: ChatMessageModel.name, schema: ChatMessageSchema },
        ]),
      ],
      providers: [TestMessageData],
    }).compile();

    messageData = module.get<TestMessageData>(TestMessageData);
  });

  beforeEach(async () => {
    messageData.deleteMany();
  });

  afterEach(async () => {
    messageData.deleteMany();
  });

  it('should be defined', () => {
    expect(messageData).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(messageData.create).toBeDefined();
    });

    it('successfully creates a message', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      expect(message).toMatchObject({
        likes: [],
        resolved: false,
        deleted: false,
        reactions: [],
        text: 'Hello world',
        senderId: senderId,
        conversationId: conversationId,
        conversation: { id: conversationId.toHexString() },
        likesCount: 0,
        sender: { id: senderId.toHexString() },
        tags: [],
      });
    });
  });

  describe('get', () => {
    it('should be defined', () => {
      expect(messageData.getMessage).toBeDefined();
    });

    it('successfully gets a message', async () => {
      const conversationId = new ObjectID();
      const sentMessage = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      const gotMessage = await messageData.getMessage(
        sentMessage.id.toHexString(),
      );

      expect(gotMessage).toMatchObject(sentMessage);
    });
  });

  describe('delete', () => {
    it('successfully marks a message as deleted', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Message to delete' },
        senderId,
      );

      expect(message.deleted).toEqual(false);

      const deletedMessage = await messageData.delete(new ObjectID(message.id));
      expect(deletedMessage.deleted).toEqual(true);

      const retrievedMessage = await messageData.getMessage(
        message.id.toHexString(),
      );
      expect(retrievedMessage.deleted).toEqual(true);
    });
  });

  // New tests for tagging feature

  describe('tags', () => {
    it('should add tags to a message', async () => {
      const message = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      const updatedMessage = await messageData.addTags(message.id, [
        'tag1',
        'tag2',
      ]);
      expect(updatedMessage.tags).toContain('tag1');
      expect(updatedMessage.tags).toContain('tag2');
    });

    it('should update tags on a message', async () => {
      const message = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      const updatedMessage = await messageData.updateTags(message.id, [
        'tag3',
        'tag4',
      ]);
      expect(updatedMessage.tags).toContain('tag3');
      expect(updatedMessage.tags).toContain('tag4');
      expect(updatedMessage.tags).not.toContain('tag1');
    });

    it('should search messages by tags', async () => {
      const message1 = await messageData.create(
        { conversationId, text: 'Message 1' },
        senderId,
      );
      await messageData.addTags(message1.id, ['tag1']);

      const message2 = await messageData.create(
        { conversationId, text: 'Message 2' },
        sender2Id,
      );
      await messageData.addTags(message2.id, ['tag2']);

      const results = await messageData.searchMessagesByTags(['tag1']);
      expect(results).toHaveLength(1);
      expect(results[0].id).toEqual(message1.id);
    });
  });
});
