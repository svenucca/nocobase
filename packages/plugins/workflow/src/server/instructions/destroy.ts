import { JOB_STATUS } from '../constants';
import type FlowNodeModel from '../models/FlowNode';

export default {
  async run(node: FlowNodeModel, input, processor) {
    const { collection, params = {} } = node.config;

    const repo = (<typeof FlowNodeModel>node.constructor).database.getRepository(collection);
    const options = processor.getParsedValue(params, node);
    const result = await repo.destroy({
      ...options,
      context: {
        executionId: processor.execution.id,
      },
      transaction: processor.transaction,
    });

    return {
      result,
      status: JOB_STATUS.RESOLVED,
    };
  },
};
