import { InstallOptions, Plugin } from '@nocobase/server';

export class CustomThemePlugin extends Plugin {
  afterAdd() {}

  beforeLoad() {}

  async load() {}

  async install(options?: InstallOptions) {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default CustomThemePlugin;
