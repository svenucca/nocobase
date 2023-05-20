import type { Database} from '@nocobase/database';
import { Model } from '@nocobase/database';
import type { BelongsToGetAssociationMixin } from 'sequelize';
import type WorkflowModel from './Workflow';

export default class FlowNodeModel extends Model {
  declare static readonly database: Database;

  declare id: number;
  declare title: string;
  declare branchIndex: null | number;
  declare type: string;
  declare config: any;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare upstream: FlowNodeModel;
  declare downstream: FlowNodeModel;

  declare workflow?: WorkflowModel;
  declare getWorkflow: BelongsToGetAssociationMixin<WorkflowModel>;
}
