module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'SQL Server Example',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'SQL',
  logging: { level: 'info' },
  entityTypes: ['IPv4'],
  defaultColor: 'light-gray',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description: 'This is a sample SQL Server Example that looks up a custom hostname',
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  block: {
    component: {
      file: './components/sql-server.js'
    },
    template: {
      file: './templates/sql-server.hbs'
    }
  },
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: 'host',
      name: 'Database Host',
      description: 'The hostname of the server hosting your SQL Server instance',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'port',
      name: 'Database Port',
      description: 'The port your database instance is listening on',
      default: 1433,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'database',
      name: 'Database Name',
      description: 'The name of the database you are connecting to',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'user',
      name: 'Windows Username',
      description: 'The windows username that you are authenticating as',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'password',
      name: 'Users Password',
      description: 'The password of the user you are authenticating as',
      default: '',
      type: 'password',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'domain',
      name: 'Windows Domain',
      description: 'The domain the database is running under (e.g., WORKGROUP)',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'query',
      name: 'Query',
      description:
        'The query you want to execute and return data for.  Replace the entity with "@entity".  (e.g., SELECT * FROM data WHERE ip = @entity).',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
