require 'sequel'
require 'sinatra'
require 'json'
DB = Sequel.connect('sqlite://mtg.db')

class SummaryApp < Sinatra::Base; end

class SummaryApp
  def link_to(job)
    "<a href='/occupations/#{job}' title='#{job}'>#{job}</a>"
  end

  get '/' do
    erb :index
  end

  get '/deck' do
    erb :deck
  end

  get '/cards' do
    erb :cards
  end

  post '/profile' do
    if DB[:profiles].where(name: params[:name]).count == 0
      DB[:profiles].insert(name: params[:name]).to_s
    else
      "Invalid - Name Taken"
    end
  end

  post '/cards/draft' do
    res = request.body.gets
    res = JSON.parse(res)
    cards = res['cards']

    cards.each do |card|
      DB[:cards].insert(
        name: card['name'],
        mana_cost: card['manaCost'],
        type: card['type'],
        supertype: (card['supertypes'].join(' ') if card['supertypes']),
        sub_type: (card['subtypes'].join(' ') if card['subtypes']),
        color: (card['colors'].join(' ') if card['colors']),
        text: card['text'],
        flavor: card['flavor'],
        power: card['power'],
        tough: card['toughness'],
        multi_id: card['multiverseid'],
        image_name: card['imageName'],
        cmc: card['cmc'],
        profile_id: res['profile_id']
      )
    end

    "success"
  end

  get "/cards/saved" do
    DB[:cards].count.to_s
  end

  get '/occupations' do
    erb :occupation
  end

  get '/occupations/all' do
    list = { :jobs => DB[:occupations].order(:transaction_total).all.reverse }
    JSON.generate(list)
  end

  get '/occupations/:occupation' do
    job = DB[:occupations].where(title: params[:occupation]).first
    JSON.generate(job)
  end

  get '/cards/:deck' do
    erb :deck
  end
end


# account for occupations that are in the same field (e.g. Lawyer and Attorney at Law are in LEGAL)