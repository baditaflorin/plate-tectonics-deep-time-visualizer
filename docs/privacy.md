# Privacy

Default mode collects no analytics and sends no telemetry.

The optional Local LLM mode sends the visible event prompt to the endpoint entered
by the user, usually `http://localhost:11434/api/generate`. That request stays on
the user's machine unless they configure a remote endpoint. No API keys are
stored or requested by the app.
