defmodule VideoRoomWeb.StatsChannel do
  @moduledoc false
  use Phoenix.Channel

  @impl true
  def join("stats", _message, socket) do
    Phoenix.PubSub.subscribe(VideoRoom.PubSub, "metrics")
    {:ok, socket}
  end

  @impl true
  def handle_info({:metrics, stats}, socket) do
    push(socket, "metrics", %{stats: stats})
    {:noreply, socket}
  end
end
