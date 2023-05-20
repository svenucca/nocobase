import type { InstallOptions} from '@nocobase/server';
import { Plugin } from '@nocobase/server';
import path from 'path';
import { getHtml } from './actions';

export class IframeBlockPlugin extends Plugin {
  afterAdd() {}

  beforeLoad() {}

  async load() {
    await this.db.import({
      directory: path.resolve(__dirname, 'collections'),
    });
    this.app.actions({
      'iframeHtml:getHtml': getHtml,
    });

    this.app.acl.allow('iframeHtml', 'getHtml', 'loggedIn');
    this.app.acl.registerSnippet({
      name: 'ui.iframeHtml',
      actions: ['iframeHtml:*'],
    });
  }

  async install(options?: InstallOptions) {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default IframeBlockPlugin;
